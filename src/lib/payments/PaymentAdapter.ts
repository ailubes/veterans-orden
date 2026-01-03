/**
 * Payment Adapter
 *
 * Provides a unified interface for different payment providers.
 * Supports LiqPay, Stripe, WayForPay, and VST Bank.
 */

import { paymentConfig } from '@/../../config/payment.config';

// Payment provider interface
export interface PaymentParams {
  amount: number;
  currency: string;
  description: string;
  userId: string;
  tier: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  provider: string;
  redirectUrl?: string;
  paymentId: string;
  data?: any;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  userId: string;
  amount: number;
  tier: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentProvider {
  createPayment(params: PaymentParams): Promise<PaymentResponse>;
  verifyWebhook(body: string | any, signature: string): Promise<boolean>;
  processCallback(data: any): Promise<PaymentResult>;
}

// Payment Adapter class
export class PaymentAdapter {
  private static providers = new Map<string, PaymentProvider>();

  /**
   * Register a payment provider
   */
  static registerProvider(name: string, provider: PaymentProvider) {
    this.providers.set(name, provider);
  }

  /**
   * Get the primary payment provider
   */
  static getPrimaryProvider(): PaymentProvider {
    const provider = this.providers.get(paymentConfig.primary);
    if (!provider) {
      throw new Error(`Primary payment provider '${paymentConfig.primary}' not registered`);
    }
    return provider;
  }

  /**
   * Get a specific payment provider by name
   */
  static getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Payment provider '${name}' not registered`);
    }
    return provider;
  }

  /**
   * Create a payment using the primary provider
   */
  static async createPayment(params: PaymentParams): Promise<PaymentResponse> {
    return this.getPrimaryProvider().createPayment(params);
  }

  /**
   * Verify webhook signature
   */
  static async verifyWebhook(providerName: string, body: any, signature: string): Promise<boolean> {
    const provider = this.getProvider(providerName);
    return provider.verifyWebhook(body, signature);
  }

  /**
   * Process payment callback
   */
  static async processCallback(providerName: string, data: any): Promise<PaymentResult> {
    const provider = this.getProvider(providerName);
    return provider.processCallback(data);
  }

  /**
   * Get payment configuration
   */
  static getConfig() {
    return paymentConfig;
  }

  /**
   * Get membership tiers
   */
  static getTiers() {
    return paymentConfig.tiers;
  }

  /**
   * Get a specific tier
   */
  static getTier(tierId: string) {
    return paymentConfig.tiers[tierId];
  }
}
