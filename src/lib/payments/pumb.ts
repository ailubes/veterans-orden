/**
 * PUMB PayHub2 payment provider implementation.
 *
 * Status: STUBBED — awaiting PUMB merchant credentials.
 * Activate by setting payment_pumb_enabled = true in organization_settings.
 *
 * PUMB PayHub2 API notes:
 * - Auth: OAuth2 client_credentials grant at {apiUrl}/auth/token
 * - Payment link: POST {apiUrl}/payment-links → returns hosted checkout URL
 * - Status check: GET {apiUrl}/payment-links/{id}/status
 * - Webhook: POSTs to server_url with payment result
 */

import type { PaymentProvider, PaymentRequest, PaymentResult, PaymentStatusResult } from './types';

interface PumbConfig {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  portalId: string;
  merchantId: string;
}

interface PumbTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface PumbPaymentLinkResponse {
  id: string;
  payment_url: string;
  status: string;
}

export class PumbProvider implements PaymentProvider {
  readonly name = 'pumb';
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: PumbConfig) {}

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 60_000) {
      return this.cachedToken.value;
    }

    const response = await fetch(`${this.config.apiUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PUMB auth failed: ${response.status} ${text}`);
    }

    const data: PumbTokenResponse = await response.json();
    this.cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return data.access_token;
  }

  async createPaymentLink(req: PaymentRequest): Promise<PaymentResult> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.config.apiUrl}/payment-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        portal_id: this.config.portalId,
        merchant_id: this.config.merchantId,
        amount: req.amount,
        currency: req.currency,
        description: req.description,
        order_id: req.orderId,
        server_url: req.serverUrl,
        result_url: req.resultUrl,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PUMB createPaymentLink failed: ${response.status} ${text}`);
    }

    const data: PumbPaymentLinkResponse = await response.json();

    return {
      type: 'redirect',
      checkoutUrl: data.payment_url,
    };
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.config.apiUrl}/payment-links/${orderId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return { orderId, status: 'unknown' };
    }

    const data = await response.json();

    const statusMap: Record<string, PaymentStatusResult['status']> = {
      success: 'success',
      paid: 'success',
      failed: 'failure',
      cancelled: 'failure',
      pending: 'pending',
    };

    return {
      orderId,
      status: statusMap[data.status] ?? 'unknown',
      amount: data.amount,
      currency: data.currency,
      providerTransactionId: data.transaction_id,
    };
  }
}
