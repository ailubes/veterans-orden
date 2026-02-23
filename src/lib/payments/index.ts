/**
 * Payment provider factory.
 *
 * Reads organization_settings from Supabase to determine the active provider.
 * LiqPay is always the fallback. PUMB activates when credentials are configured.
 *
 * Usage:
 * ```typescript
 * const provider = await getActiveProvider(supabase);
 * const result = await provider.createPaymentLink({ ... });
 * ```
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { PaymentProvider } from './types';
import { LiqPayProvider } from './liqpay';
import { PumbProvider } from './pumb';

const PUMB_SETTING_KEYS = [
  'payment_pumb_enabled',
  'payment_pumb_client_id',
  'payment_pumb_client_secret',
  'payment_pumb_api_url',
  'payment_pumb_portal_id',
  'payment_pumb_merchant_id',
] as const;

const LIQPAY_SETTING_KEYS = [
  'payment_liqpay_enabled',
  'payment_liqpay_public_key',
  'payment_liqpay_private_key',
  'payment_liqpay_sandbox_mode',
  'payment_currency',
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getActiveProvider(supabase: SupabaseClient<any, any, any>): Promise<PaymentProvider> {
  const allKeys = [...PUMB_SETTING_KEYS, ...LIQPAY_SETTING_KEYS];

  const { data: settings } = await supabase
    .from('organization_settings')
    .select('key, value')
    .in('key', allKeys);

  const map = new Map<string, string>(
    (settings || []).map((s: { key: string; value: string }) => [s.key, s.value])
  );

  const get = (key: string) => map.get(key) ?? '';
  const getBool = (key: string) => get(key) === 'true' || get(key) === '1';

  // Check PUMB first
  const pumbEnabled = getBool('payment_pumb_enabled');
  const pumbClientId = get('payment_pumb_client_id');
  const pumbClientSecret = get('payment_pumb_client_secret');
  const pumbApiUrl = get('payment_pumb_api_url');

  if (pumbEnabled && pumbClientId && pumbClientSecret && pumbApiUrl) {
    return new PumbProvider({
      clientId: pumbClientId,
      clientSecret: pumbClientSecret,
      apiUrl: pumbApiUrl,
      portalId: get('payment_pumb_portal_id'),
      merchantId: get('payment_pumb_merchant_id'),
    });
  }

  // Fall back to LiqPay
  return new LiqPayProvider({
    publicKey: get('payment_liqpay_public_key'),
    privateKey: get('payment_liqpay_private_key'),
    currency: get('payment_currency') || 'UAH',
    sandboxMode: getBool('payment_liqpay_sandbox_mode'),
  });
}
