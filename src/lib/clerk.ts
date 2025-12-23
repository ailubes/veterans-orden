import { currentUser, auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get current member from database based on Clerk user
 */
export async function getCurrentMember() {
  const { userId } = auth();
  if (!userId) return null;

  const member = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: {
      oblast: true,
      group: true,
    },
  });

  return member;
}

/**
 * Require authenticated member, throws if not found
 */
export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) {
    throw new Error('Unauthorized');
  }
  return member;
}

/**
 * Require specific role(s)
 */
export async function requireRole(allowedRoles: string[]) {
  const member = await requireMember();
  if (!allowedRoles.includes(member.role)) {
    throw new Error('Forbidden');
  }
  return member;
}

/**
 * Check if user has admin access
 */
export async function requireAdmin() {
  return requireRole(['admin', 'super_admin']);
}

/**
 * Check if user is a full member (can vote, attend events, etc.)
 */
export async function requireFullMember() {
  return requireRole(['full_member', 'group_leader', 'regional_leader', 'admin', 'super_admin']);
}

/**
 * Get Clerk user data
 */
export async function getClerkUser() {
  return currentUser();
}
