/**
 * Payment Configuration
 *
 * Defines payment providers and membership tiers for Order of Veterans.
 * Uses VST Bank as the primary payment provider.
 */

export type PaymentProvider = 'liqpay' | 'stripe' | 'wayforpay' | 'vstbank';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  benefits: string[];
}

export const paymentConfig = {
  // Primary payment provider
  primary: 'vstbank' as PaymentProvider,

  // Enabled payment providers
  enabled: ['vstbank'] as PaymentProvider[],

  // Membership tiers
  tiers: {
    supporter_50: {
      id: 'supporter_50',
      name: 'Прихильник',
      price: 50,
      currency: 'UAH',
      description: 'Базова підтримка організації',
      benefits: [
        'Доступ до новин та оновлень',
        'Участь у відкритих подіях',
        'Інформаційна підтримка',
      ],
    },
    member_150: {
      id: 'member_150',
      name: 'Член Ордену',
      price: 150,
      currency: 'UAH',
      description: 'Повне членство в організації',
      benefits: [
        'Всі переваги рівня "Прихильник"',
        'Право голосу в рішеннях',
        'Доступ до завдань та місій',
        'Програма лояльності',
        'Юридична консультація',
      ],
    },
    patron_500: {
      id: 'patron_500',
      name: 'Патрон',
      price: 500,
      currency: 'UAH',
      description: 'Максимальна підтримка організації',
      benefits: [
        'Всі переваги рівня "Член Ордену"',
        'VIP доступ до подій',
        'Персональна подяка',
        'Пріоритетна підтримка',
        'Участь у стратегічних обговореннях',
      ],
    },
  } as Record<string, MembershipTier>,

  // Payment provider configurations
  providers: {
    vstbank: {
      name: 'VST Bank',
      merchantId: process.env.VSTBANK_MERCHANT_ID,
      apiKey: process.env.VSTBANK_API_KEY,
      secretKey: process.env.VSTBANK_SECRET_KEY,
      webhookSecret: process.env.VSTBANK_WEBHOOK_SECRET,
      // Additional configuration to be added when VST Bank details are provided
      apiUrl: process.env.VSTBANK_API_URL || '',
      testMode: process.env.NODE_ENV !== 'production',
    },
  },

  // Payment settings
  settings: {
    currency: 'UAH',
    locale: 'uk-UA',
    returnUrl: '/payment/success',
    cancelUrl: '/payment/cancel',
    webhookUrl: '/api/webhooks/payment',
  },
} as const;

export type PaymentConfig = typeof paymentConfig;
