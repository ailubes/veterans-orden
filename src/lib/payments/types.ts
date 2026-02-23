/**
 * Payment provider abstraction layer.
 * Allows switching between LiqPay and PUMB (or other providers) via config.
 */

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  resultUrl: string;
  serverUrl: string;
}

export interface PaymentResult {
  /**
   * For form-based providers (LiqPay): data + signature to POST to checkout URL.
   * For redirect-based providers (PUMB): a direct hosted checkout URL.
   */
  type: 'form' | 'redirect';
  checkoutUrl: string;
  /** Present when type === 'form' */
  formData?: { data: string; signature: string };
}

export interface PaymentStatusResult {
  orderId: string;
  status: 'pending' | 'success' | 'failure' | 'unknown';
  amount?: number;
  currency?: string;
  providerTransactionId?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createPaymentLink(req: PaymentRequest): Promise<PaymentResult>;
  getPaymentStatus(orderId: string): Promise<PaymentStatusResult>;
}

export interface PaymentProviderSettings {
  liqpay: {
    enabled: boolean;
    publicKey: string;
    privateKey: string;
    sandboxMode: boolean;
    currency: string;
  };
  pumb: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    apiUrl: string;
    portalId: string;
    merchantId: string;
  };
}
