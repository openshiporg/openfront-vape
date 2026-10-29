export interface PublicPaymentProviderConfig {
  provider: 'stripe' | 'paypal' | 'authorizenet';
  publishableKey?: string;
  apiLoginId?: string;
  clientKey?: string;
  env?: 'sandbox' | 'production';
}

export function isPaymentProviderConfigured(code: string): boolean {
  if (code.startsWith('pp_authorizenet')) return Boolean(process.env.AUTHORIZENET_API_LOGIN_ID && process.env.AUTHORIZENET_TRANSACTION_KEY && process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY);
  if (code.startsWith('pp_stripe')) {
    return Boolean(
      (process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.STRIPE_PUBLISHABLE_KEY) &&
      process.env.STRIPE_SECRET_KEY
    );
  }
  if (code.startsWith('pp_paypal')) {
    return Boolean(
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET
    );
  }
  return code === 'pp_system_default' || code.startsWith('pp_manual');
}

export function getPublicPaymentProviderConfig(
  code: string
): PublicPaymentProviderConfig | null {
  if (!isPaymentProviderConfigured(code)) return null;

  if (code.startsWith('pp_stripe')) {
    return {
      provider: 'stripe',
      publishableKey:
        process.env.NEXT_PUBLIC_STRIPE_KEY ||
        process.env.STRIPE_PUBLISHABLE_KEY ||
        '',
    };
  }
  if (code.startsWith('pp_authorizenet')) return { provider: 'authorizenet', apiLoginId: process.env.AUTHORIZENET_API_LOGIN_ID, clientKey: process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY, env: process.env.AUTHORIZENET_ENV === 'production' ? 'production' : 'sandbox' };
  if (code.startsWith('pp_paypal')) {
    return {
      provider: 'paypal',
      publishableKey: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    };
  }
  return null;
}
