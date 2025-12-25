import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();

  const supabase = await createClient();
  const { data: member } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', user.id)
    .single();

  if (!member || !allowedRoles.includes(member.role)) {
    redirect('/dashboard');
  }

  return { user, role: member.role };
}

export async function getMember() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: member } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', user.id)
    .single();

  return member;
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
