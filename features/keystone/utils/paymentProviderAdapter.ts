import { paymentProviderAdapters } from "../../integrations/payment";

const ADAPTER_OPERATIONS = new Set(["createPaymentFunction", "capturePaymentFunction", "refundPaymentFunction", "getPaymentStatusFunction", "generatePaymentLinkFunction", "handleWebhookFunction"]);
export function paymentAdapterPayload(provider: any, args: any) {
  const input: Record<string, any> = {};
  for (const key of ["cart", "order", "amount", "currency", "idempotencyKey", "paymentId", "refundId", "event", "headers", "rawBody", "opaqueData"]) if (args?.[key] !== undefined) input[key] = args[key];
  if (input.headers && typeof input.headers === "object") input.headers = Object.fromEntries(Object.entries(input.headers).filter(([key]) => ["stripe-signature", "x-anet-signature"].includes(key.toLowerCase()) || key.toLowerCase().startsWith("paypal-")));
  return { ...input, provider: { id: provider.id, code: provider.code, credentials: provider.credentials || {} } };
}
export async function executeAdapterFunction({ provider, functionName, args }: { provider: Record<string, any>; functionName: string; args: Record<string, any> }) {
  if (!ADAPTER_OPERATIONS.has(functionName)) throw new Error("Unknown payment adapter operation");
  const functionPath = provider?.[functionName]; if (typeof functionPath !== "string") throw new Error("Payment adapter is not configured");
  const payload = paymentAdapterPayload(provider, args);
  if (/^https?:/i.test(functionPath)) {
    try { const response = await fetch(functionPath, { method: "POST", redirect: "error", signal: AbortSignal.timeout(30_000), headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error(); return await response.json(); }
    catch { throw new Error("External payment adapter request failed; reconcile the original attempt before retrying"); }
  }
  const loader = paymentProviderAdapters[functionPath as keyof typeof paymentProviderAdapters]; if (!loader) throw new Error("Unknown registered payment adapter");
  const adapter = await loader(); const fn = (adapter as any)[functionName]; if (typeof fn !== "function") throw new Error("Payment adapter operation is unavailable");
  try { return await fn(payload); } catch { throw new Error(`Payment adapter ${functionName} failed; reconcile the original attempt before retrying`); }
}

// Helper functions for common payment operations
type PaymentOperationArgs = {
  provider: Record<string, any>;
  paymentId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
};

export async function createPayment({ provider, cart, order, amount, currency, idempotencyKey, opaqueData }: {
  provider: Record<string, any>;
  cart?: Record<string, any>;
  order?: Record<string, any>;
  amount: number;
  currency: string;
  idempotencyKey?: string;
  opaqueData?: { dataDescriptor: string; dataValue: string };
}) {
  return executeAdapterFunction({ provider, functionName: "createPaymentFunction", args: { cart, order, amount, currency, idempotencyKey, opaqueData } });
}

export async function capturePayment({ provider, paymentId, amount, currency, idempotencyKey }: PaymentOperationArgs) {
  return executeAdapterFunction({
    provider,
    functionName: "capturePaymentFunction",
    args: { paymentId, amount, currency, idempotencyKey },
  });
}

export async function refundPayment({ provider, paymentId, amount, currency, idempotencyKey }: PaymentOperationArgs) {
  return executeAdapterFunction({
    provider,
    functionName: "refundPaymentFunction",
    args: { paymentId, amount, currency, idempotencyKey },
  });
}

export async function getPaymentStatus({ provider, paymentId }: { provider: Record<string, any>; paymentId: string }) {
  return executeAdapterFunction({
    provider,
    functionName: "getPaymentStatusFunction",
    args: { paymentId },
  });
}

export async function generatePaymentLink({ provider, paymentId }: { provider: Record<string, any>; paymentId: string }) {
  return executeAdapterFunction({
    provider,
    functionName: "generatePaymentLinkFunction",
    args: { paymentId },
  });
}

export async function handleWebhook({ provider, event, headers, rawBody }: { provider: Record<string, any>; event: unknown; headers: Record<string, string>; rawBody?: string }) {
  return executeAdapterFunction({ provider, functionName: "handleWebhookFunction", args: { event, headers, rawBody: rawBody || headers.__rawBody } });
}
