import { createClient } from '@/lib/supabase/server';
import type {
  AwardPointsParams,
  SpendPointsParams,
  PointsTransaction,
  UserPointsBalance,
  PointsHistoryOptions,
} from './types';

/**
 * Award points to a user and create a transaction record
 */
export async function awardPoints(params: AwardPointsParams): Promise<PointsTransaction> {
  const {
    userId,
    amount,
    type,
    referenceType,
    referenceId,
    description,
    createdById,
    metadata,
  } = params;

  if (amount <= 0) {
    throw new Error('Award amount must be positive');
  }

  const supabase = await createClient();

  // Get current user balance
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('points, current_year_points')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const currentBalance = user.points || 0;
  const newBalance = currentBalance + amount;

  // Calculate year and expiration
  const now = new Date();
  const earnedYear = now.getFullYear();
  const expiresAt = new Date(earnedYear, 11, 31, 23, 59, 59); // Dec 31, 11:59:59 PM

  // Create transaction record
  const { data: transaction, error: transactionError } = await supabase
    .from('points_transactions')
    .insert({
      user_id: userId,
      type,
      amount,
      balance_after: newBalance,
      earned_year: earnedYear,
      expires_at: expiresAt.toISOString(),
      reference_type: referenceType || null,
      reference_id: referenceId || null,
      description,
      metadata: metadata || null,
      created_by_id: createdById || null,
    })
    .select()
    .single();

  if (transactionError || !transaction) {
    throw new Error('Failed to create transaction: ' + transactionError?.message);
  }

  // Update user balance
  const currentYearPoints = (user.current_year_points || 0) + amount;
  const { error: updateError } = await supabase
    .from('users')
    .update({
      points: newBalance,
      current_year_points: currentYearPoints,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error('Failed to update user balance: ' + updateError.message);
  }

  return {
    id: transaction.id,
    userId: transaction.user_id,
    type: transaction.type,
    amount: transaction.amount,
    balanceAfter: transaction.balance_after,
    earnedYear: transaction.earned_year,
    expiresAt: transaction.expires_at,
    referenceType: transaction.reference_type,
    referenceId: transaction.reference_id,
    description: transaction.description,
    metadata: transaction.metadata,
    createdAt: transaction.created_at,
    createdById: transaction.created_by_id,
  };
}

/**
 * Spend points from a user's balance
 */
export async function spendPoints(params: SpendPointsParams): Promise<PointsTransaction> {
  const { userId, amount, type, referenceType, referenceId, description, metadata } = params;

  if (amount <= 0) {
    throw new Error('Spend amount must be positive');
  }

  const supabase = await createClient();

  // Get current user balance
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('points, current_year_points')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const currentBalance = user.points || 0;

  if (currentBalance < amount) {
    throw new Error(`Insufficient points. Available: ${currentBalance}, Required: ${amount}`);
  }

  const newBalance = currentBalance - amount;

  // Create transaction record with negative amount
  const { data: transaction, error: transactionError } = await supabase
    .from('points_transactions')
    .insert({
      user_id: userId,
      type,
      amount: -amount, // Negative for spending
      balance_after: newBalance,
      reference_type: referenceType || null,
      reference_id: referenceId || null,
      description,
      metadata: metadata || null,
    })
    .select()
    .single();

  if (transactionError || !transaction) {
    throw new Error('Failed to create transaction: ' + transactionError?.message);
  }

  // Update user balance (subtract from current year first, then total)
  const currentYearSpend = Math.min(user.current_year_points || 0, amount);
  const newCurrentYearPoints = (user.current_year_points || 0) - currentYearSpend;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      points: newBalance,
      current_year_points: newCurrentYearPoints,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error('Failed to update user balance: ' + updateError.message);
  }

  return {
    id: transaction.id,
    userId: transaction.user_id,
    type: transaction.type,
    amount: transaction.amount,
    balanceAfter: transaction.balance_after,
    earnedYear: transaction.earned_year,
    expiresAt: transaction.expires_at,
    referenceType: transaction.reference_type,
    referenceId: transaction.reference_id,
    description: transaction.description,
    metadata: transaction.metadata,
    createdAt: transaction.created_at,
    createdById: transaction.created_by_id,
  };
}

/**
 * Get user's current points balance with expiration info
 */
export async function getUserBalance(userId: string): Promise<UserPointsBalance> {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('points, current_year_points')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
  const daysUntilExpiration = Math.ceil((endOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Points expiring soon (within 30 days)
  const expiringSoon = daysUntilExpiration <= 30 ? (user.current_year_points || 0) : 0;

  return {
    total: user.points || 0,
    currentYear: user.current_year_points || 0,
    expiringSoon,
    expirationDate: daysUntilExpiration <= 30 ? endOfYear.toISOString() : null,
  };
}

/**
 * Get user's points transaction history
 */
export async function getPointsHistory(
  userId: string,
  options: PointsHistoryOptions = {}
): Promise<PointsTransaction[]> {
  const { limit = 50, offset = 0, type, startDate, endDate } = options;

  const supabase = await createClient();

  let query = supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('type', type);
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data: transactions, error } = await query;

  if (error) {
    throw new Error('Failed to fetch points history: ' + error.message);
  }

  return (transactions || []).map((t) => ({
    id: t.id,
    userId: t.user_id,
    type: t.type,
    amount: t.amount,
    balanceAfter: t.balance_after,
    earnedYear: t.earned_year,
    expiresAt: t.expires_at,
    referenceType: t.reference_type,
    referenceId: t.reference_id,
    description: t.description,
    metadata: t.metadata,
    createdAt: t.created_at,
    createdById: t.created_by_id,
  }));
}

/**
 * Expire annual points (run on Jan 1st)
 */
export async function expireAnnualPoints(): Promise<{ usersProcessed: number; pointsExpired: number }> {
  const supabase = await createClient();
  const now = new Date();
  const previousYear = now.getFullYear() - 1;

  // Get all users with current year points > 0
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, current_year_points, points')
    .gt('current_year_points', 0);

  if (usersError) {
    throw new Error('Failed to fetch users for expiration: ' + usersError.message);
  }

  let usersProcessed = 0;
  let totalPointsExpired = 0;

  for (const user of users || []) {
    const pointsToExpire = user.current_year_points || 0;
    if (pointsToExpire <= 0) continue;

    const newBalance = (user.points || 0) - pointsToExpire;

    // Create expiration transaction
    await supabase.from('points_transactions').insert({
      user_id: user.id,
      type: 'expire_annual',
      amount: -pointsToExpire,
      balance_after: newBalance,
      earned_year: previousYear,
      description: `Згорання балів за ${previousYear} рік`,
    });

    // Update user balance
    await supabase
      .from('users')
      .update({
        points: newBalance,
        current_year_points: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    usersProcessed++;
    totalPointsExpired += pointsToExpire;
  }

  return {
    usersProcessed,
    pointsExpired: totalPointsExpired,
  };
}
