import crypto from 'crypto';

export interface LiqPayParams {
  version: number;
  public_key: string;
  action: 'pay' | 'subscribe';
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url?: string;
  server_url?: string;
  language?: 'uk' | 'en' | 'ru';
  sandbox?: number;
}

export interface LiqPayCallback {
  action: string;
  payment_id: number;
  status: string;
  order_id: string;
  amount: number;
  currency: string;
  description: string;
  sender_phone?: string;
  sender_card_mask2?: string;
  sender_card_bank?: string;
  sender_card_type?: string;
  sender_first_name?: string;
  sender_last_name?: string;
  err_code?: string;
  err_description?: string;
}

export interface LiqPayConfig {
  publicKey: string;
  privateKey: string;
  currency: string;
  sandboxMode: boolean;
}

export function createLiqPayData(
  params: Partial<LiqPayParams>,
  config: LiqPayConfig
): string {
  const data: LiqPayParams = {
    version: 3,
    public_key: config.publicKey,
    action: 'pay',
    currency: config.currency,
    language: 'uk',
    sandbox: config.sandboxMode ? 1 : 0,
    ...params,
  } as LiqPayParams;

  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString).toString('base64');
}

export function createLiqPaySignature(data: string, privateKey: string): string {
  const signString = privateKey + data + privateKey;
  return crypto.createHash('sha1').update(signString).digest('base64');
}

export function verifyLiqPayCallback(
  data: string,
  signature: string,
  privateKey: string
): boolean {
  const expectedSignature = createLiqPaySignature(data, privateKey);
  return expectedSignature === signature;
}

export function decodeLiqPayData(data: string): LiqPayCallback {
  const jsonString = Buffer.from(data, 'base64').toString('utf-8');
  return JSON.parse(jsonString);
}

export function generateOrderId(userId: string, tierId: string): string {
  const timestamp = Date.now();
  return `membership_${userId}_${tierId}_${timestamp}`;
}

export function parseOrderId(orderId: string): { userId: string; tierId: string } | null {
  const match = orderId.match(/^membership_(.+)_(.+)_\d+$/);
  if (!match) return null;
  return { userId: match[1], tierId: match[2] };
}
