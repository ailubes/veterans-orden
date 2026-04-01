import crypto from 'crypto';

export interface HutkoConfig {
  merchantId: number;
  secretKey: string;
}

function createSignature(params: Record<string, string | number>, secretKey: string): string {
  const sortedValues = Object.keys(params)
    .sort()
    .map((k) => String(params[k]))
    .filter((v) => v !== '');
  const data = [secretKey, ...sortedValues].join('|');
  return crypto.createHash('sha1').update(data).digest('hex');
}

export async function createHutkoToken(
  config: HutkoConfig,
  opts: {
    orderId: string;
    orderDesc: string;
    amount: number; // in kopiyki (e.g. 49 UAH = 4900)
    currency: string;
    serverCallbackUrl: string;
    responseUrl?: string;
    requiredRectoken?: 'Y' | 'N';
  }
): Promise<{ token: string; checkoutUrl: string }> {
  const requestParams: Record<string, string | number> = {
    merchant_id: config.merchantId,
    order_id: opts.orderId,
    order_desc: opts.orderDesc,
    amount: opts.amount,
    currency: opts.currency,
    server_callback_url: opts.serverCallbackUrl,
    required_rectoken: opts.requiredRectoken ?? 'Y',
  };

  if (opts.responseUrl) {
    requestParams.response_url = opts.responseUrl;
  }

  const signature = createSignature(requestParams, config.secretKey);

  const res = await fetch('https://pay.hutko.org/api/checkout/url/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request: { ...requestParams, signature } }),
  });

  const data = await res.json();
  if (data.response?.response_status !== 'success' || !data.response?.checkout_url) {
    throw new Error(`HUTKO checkout URL error: ${data.response?.error_message || 'Missing checkout URL'}`);
  }
  const checkoutUrl = data.response.checkout_url as string;
  const token = new URL(checkoutUrl).searchParams.get('token') ?? '';

  return {
    token,
    checkoutUrl,
  };
}

export async function createHutkoRecurringCharge(
  config: HutkoConfig,
  opts: {
    orderId: string;
    orderDesc: string;
    amount: number; // in kopiyki (e.g. 49 UAH = 4900)
    currency: string;
    rectoken: string;
  }
): Promise<{ success: boolean; paymentId?: string; errorMessage?: string }> {
  const requestParams: Record<string, string | number> = {
    merchant_id: config.merchantId,
    order_id: opts.orderId,
    order_desc: opts.orderDesc,
    amount: opts.amount,
    currency: opts.currency,
    rectoken: opts.rectoken,
  };
  const signature = createSignature(requestParams, config.secretKey);

  const res = await fetch('https://pay.hutko.org/api/checkout/recurring/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request: { ...requestParams, signature } }),
  });

  const data = await res.json();
  const response = data.response;
  if (response?.response_status === 'success' && response?.order_status === 'approved') {
    return { success: true, paymentId: String(response.payment_id) };
  }
  return { success: false, errorMessage: response?.error_message || response?.order_status };
}

export function verifyHutkoCallback(
  params: Record<string, string>,
  secretKey: string
): boolean {
  // Exclude 'signature' and 'response_signature_string' (Fondy debugging field)
  const { signature, response_signature_string: _rss, ...rest } = params;
  const dataParams = rest as Record<string, string | number>;

  // Try both formats — callbacks use secret on both sides (Fondy spec),
  // but some environments use only the leading secret
  const sortedValues = Object.keys(dataParams)
    .sort()
    .map((k) => String(dataParams[k]))
    .filter((v) => v !== '');

  const withBothSides = [secretKey, ...sortedValues, secretKey].join('|');
  const withLeadingOnly = [secretKey, ...sortedValues].join('|');

  const hashBoth = crypto.createHash('sha1').update(withBothSides).digest('hex');
  const hashLeading = crypto.createHash('sha1').update(withLeadingOnly).digest('hex');

  return hashBoth === signature || hashLeading === signature;
}
