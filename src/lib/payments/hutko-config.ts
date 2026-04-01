export interface HutkoRuntimeConfig {
  enabled: boolean;
  merchantId: string;
  secretKey: string;
  creditKey: string;
  baseUrl: string;
  source: 'env' | 'none';
}

function getEnvBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://ordenv.org';
}

function getEnvConfig(): HutkoRuntimeConfig | null {
  const merchantId = process.env.HUTKO_MERCHANT_ID?.trim() || '';
  const secretKey = process.env.HUTKO_SECRET_KEY?.trim() || '';
  const creditKey = process.env.HUTKO_CREDIT_KEY?.trim() || '';
  const enabledValue = process.env.HUTKO_ENABLED?.trim().toLowerCase();
  const enabled = enabledValue ? enabledValue === 'true' || enabledValue === '1' : true;

  if (!merchantId || !secretKey) {
    return null;
  }

  return {
    enabled,
    merchantId,
    secretKey,
    creditKey,
    baseUrl: getEnvBaseUrl(),
    source: 'env',
  };
}

export async function getHutkoConfig(): Promise<HutkoRuntimeConfig> {
  const envConfig = getEnvConfig();
  if (envConfig) {
    return envConfig;
  }

  return {
    enabled: false,
    merchantId: '',
    secretKey: '',
    creditKey: '',
    baseUrl: getEnvBaseUrl(),
    source: 'none',
  };
}
