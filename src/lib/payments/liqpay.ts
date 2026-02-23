/**
 * LiqPay payment provider implementation.
 * Wraps the existing src/lib/liqpay.ts utilities behind the PaymentProvider interface.
 */

import {
  createLiqPayData,
  createLiqPaySignature,
  type LiqPayConfig,
} from '@/lib/liqpay';
import type { PaymentProvider, PaymentRequest, PaymentResult, PaymentStatusResult } from './types';

export class LiqPayProvider implements PaymentProvider {
  readonly name = 'liqpay';

  constructor(private readonly config: LiqPayConfig) {}

  async createPaymentLink(req: PaymentRequest): Promise<PaymentResult> {
    const data = createLiqPayData(
      {
        action: 'pay',
        amount: req.amount,
        description: req.description,
        order_id: req.orderId,
        result_url: req.resultUrl,
        server_url: req.serverUrl,
      },
      this.config
    );

    const signature = createLiqPaySignature(data, this.config.privateKey);

    return {
      type: 'form',
      checkoutUrl: 'https://www.liqpay.ua/api/3/checkout',
      formData: { data, signature },
    };
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
    // LiqPay status is determined via server callback (webhook) in practice.
    // This is a stub for interface completeness.
    return {
      orderId,
      status: 'unknown',
    };
  }
}
