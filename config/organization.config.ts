/**
 * Organization Configuration
 *
 * This file contains all organization-specific identity, branding,
 * navigation, and social media information for Order of Veterans.
 */

export const organizationConfig = {
  // Organization identity
  id: 'veterans-orden',
  name: {
    full: 'Громадська Організація «Орден Ветеранів»',
    short: 'Орден Ветеранів',
    english: 'Order of Veterans',
  },

  // Mission and tagline
  mission: {
    statement: 'Об\'єднуємо ветеранів у братерство честі та дії',
    tagline: 'МІЦНІСТЬ, ЯКА НЕ ТРІСКАЄ',
    description: 'Ми будуємо внутрішню структуру для тих, хто тримав фронт історії. Підтримка, захист прав, адаптація, братерство та дія.',
  },

  // Membership goals
  memberGoal: 10_000,
  milestones: [
    { target: 1_000, label: 'Перша командерія' },
    { target: 5_000, label: 'Національна мережа' },
    { target: 10_000, label: 'Системний вплив' },
  ],

  // Domain and URLs
  domain: 'veterans-orden.org',
  urls: {
    main: 'https://veterans-orden.org',
    staging: 'https://veterans-orden.netlify.app',
  },

  // Main navigation
  navigation: [
    { href: '/about', label: 'ПРО ОРДЕН' },
    { href: '/directions', label: 'НАПРЯМИ' },
    { href: '/events', label: 'ПОДІЇ' },
    { href: '/campaigns', label: 'КАМПАНІЇ' },
    { href: '/news', label: 'НОВИНИ' },
    { href: '/support', label: 'ПІДТРИМАТИ' },
    { href: '/join', label: 'ПРИЄДНАТИСЯ' },
  ],

  // Social media links
  social: {
    telegram: '', // To be provided
    facebook: '', // To be provided
    instagram: '', // To be provided
    youtube: '', // To be provided
    twitter: '',
  },

  // Contact information
  contact: {
    email: 'info@veterans-orden.org',
    phone: '', // To be provided
    address: '', // To be provided
  },

  // Legal information
  legal: {
    organizationType: 'Громадська організація',
    nonProfitCode: '0032', // Громадські об'єднання
    registrationYear: 2024,
  },

  // Locale and currency
  locale: 'uk-UA',
  currency: 'UAH',
  timezone: 'Europe/Kyiv',
} as const;

export type OrganizationConfig = typeof organizationConfig;
