/**
 * Type-safe parser for organization settings stored as JSONB
 *
 * Handles the conversion between database JSONB format and TypeScript types
 */

export function parseSettingValue<T>(
  value: unknown,
  type: 'boolean' | 'string' | 'number' | 'json'
): T {
  if (value === null || value === undefined) {
    return null as T;
  }

  switch (type) {
    case 'boolean':
      // Handle both boolean and string representations
      if (typeof value === 'boolean') {
        return value as T;
      }
      return (value === 'true' || value === '1' || value === 1) as T;

    case 'number':
      if (typeof value === 'number') {
        return value as T;
      }
      const parsed = parseInt(String(value), 10);
      return (isNaN(parsed) ? 0 : parsed) as T;

    case 'json':
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      }
      return value as T;

    case 'string':
    default:
      return String(value) as T;
  }
}

/**
 * Payment settings interface
 */
export interface PaymentSettings {
  payment_liqpay_enabled: boolean;
  payment_liqpay_public_key: string;
  payment_liqpay_private_key: string;
  payment_liqpay_sandbox_mode: boolean;
  payment_currency: string;
  payment_success_bonus_points: number;
}

/**
 * Parse payment settings from a Map of setting key-value pairs
 */
export function parsePaymentSettings(
  settingsMap: Map<string, unknown>
): PaymentSettings {
  return {
    payment_liqpay_enabled: parseSettingValue(
      settingsMap.get('payment_liqpay_enabled'),
      'boolean'
    ),
    payment_liqpay_public_key: parseSettingValue(
      settingsMap.get('payment_liqpay_public_key'),
      'string'
    ),
    payment_liqpay_private_key: parseSettingValue(
      settingsMap.get('payment_liqpay_private_key'),
      'string'
    ),
    payment_liqpay_sandbox_mode: parseSettingValue(
      settingsMap.get('payment_liqpay_sandbox_mode'),
      'boolean'
    ),
    payment_currency:
      parseSettingValue(settingsMap.get('payment_currency'), 'string') || 'UAH',
    payment_success_bonus_points:
      parseSettingValue(
        settingsMap.get('payment_success_bonus_points'),
        'number'
      ) || 50,
  };
}

/**
 * System settings interface
 */
export interface SystemSettings {
  system_maintenance_mode: boolean;
  system_registration_enabled: boolean;
  system_default_membership_tier: string;
  system_voting_enabled: boolean;
  system_events_enabled: boolean;
  system_tasks_enabled: boolean;
  system_challenges_enabled: boolean;
}

/**
 * Parse system settings from a Map of setting key-value pairs
 */
export function parseSystemSettings(
  settingsMap: Map<string, unknown>
): SystemSettings {
  return {
    system_maintenance_mode: parseSettingValue(
      settingsMap.get('system_maintenance_mode'),
      'boolean'
    ),
    system_registration_enabled: parseSettingValue(
      settingsMap.get('system_registration_enabled'),
      'boolean'
    ),
    system_default_membership_tier:
      parseSettingValue(
        settingsMap.get('system_default_membership_tier'),
        'string'
      ) || 'free',
    system_voting_enabled: parseSettingValue(
      settingsMap.get('system_voting_enabled'),
      'boolean'
    ),
    system_events_enabled: parseSettingValue(
      settingsMap.get('system_events_enabled'),
      'boolean'
    ),
    system_tasks_enabled: parseSettingValue(
      settingsMap.get('system_tasks_enabled'),
      'boolean'
    ),
    system_challenges_enabled: parseSettingValue(
      settingsMap.get('system_challenges_enabled'),
      'boolean'
    ),
  };
}

/**
 * Points settings interface
 */
export interface PointsSettings {
  points_event_attendance: number;
  points_vote_cast: number;
  points_task_completion: number;
  points_referral: number;
  points_challenge_win: number;
}

/**
 * Parse points settings from a Map of setting key-value pairs
 */
export function parsePointsSettings(
  settingsMap: Map<string, unknown>
): PointsSettings {
  return {
    points_event_attendance:
      parseSettingValue(settingsMap.get('points_event_attendance'), 'number') ||
      10,
    points_vote_cast:
      parseSettingValue(settingsMap.get('points_vote_cast'), 'number') || 5,
    points_task_completion:
      parseSettingValue(settingsMap.get('points_task_completion'), 'number') ||
      20,
    points_referral:
      parseSettingValue(settingsMap.get('points_referral'), 'number') || 50,
    points_challenge_win:
      parseSettingValue(settingsMap.get('points_challenge_win'), 'number') ||
      100,
  };
}
