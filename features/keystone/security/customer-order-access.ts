type CustomerOrderIdentity = {
  userId?: string | null;
  secretKey?: string | null;
};

export function hasCustomerOrderCredential(
  sessionUserId: string | null | undefined,
  secretKey: string | null | undefined,
): boolean {
  return Boolean(sessionUserId || secretKey);
}

export function canReadCustomerOrder(
  order: CustomerOrderIdentity | null | undefined,
  sessionUserId: string | null | undefined,
  secretKey: string | null | undefined,
): boolean {
  if (!order) return false;
  if (secretKey) return Boolean(order.secretKey && order.secretKey === secretKey);
  return Boolean(sessionUserId && order.userId === sessionUserId);
}
