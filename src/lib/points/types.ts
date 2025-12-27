export type PointsTransactionType =
  | 'earn_task'
  | 'earn_event'
  | 'earn_vote'
  | 'earn_referral'
  | 'earn_daily_login'
  | 'earn_content'
  | 'earn_challenge'
  | 'earn_admin'
  | 'spend_marketplace'
  | 'spend_event'
  | 'spend_admin'
  | 'expire_annual'
  | 'refund';

export interface PointsTransaction {
  id: string;
  userId: string;
  type: PointsTransactionType;
  amount: number;
  balanceAfter: number;
  earnedYear: number | null;
  expiresAt: string | null;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  createdById: string | null;
}

export interface AwardPointsParams {
  userId: string;
  amount: number;
  type: PointsTransactionType;
  referenceType?: string;
  referenceId?: string;
  description: string;
  createdById?: string;
  metadata?: Record<string, unknown>;
}

export interface SpendPointsParams {
  userId: string;
  amount: number;
  type: 'spend_marketplace' | 'spend_event' | 'spend_admin';
  referenceType?: string;
  referenceId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface UserPointsBalance {
  total: number;
  currentYear: number;
  expiringSoon: number;
  expirationDate: string | null;
}

export interface PointsHistoryOptions {
  limit?: number;
  offset?: number;
  type?: PointsTransactionType;
  startDate?: Date;
  endDate?: Date;
}
