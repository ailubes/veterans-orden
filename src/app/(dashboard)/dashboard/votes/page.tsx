import { createClient } from '@/lib/supabase/server';
import VotesList from '@/components/votes/votes-list';
import { HelpTooltip } from '@/components/help/help-tooltip';

export default async function VotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
      .from('users')
      .select('id, role, membership_role, commandery_id, status')
      .eq('auth_id', user.id)
      .single()
    : { data: null };

  // Fetch active votes
  const { data: activeVotes } = await supabase
    .from('votes')
    .select('*')
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .order('end_date', { ascending: true });

  // Fetch closed votes
  const { data: closedVotes } = await supabase
    .from('votes')
    .select('*')
    .eq('status', 'closed')
    .order('end_date', { ascending: false })
    .limit(5);

  const primariesAllowedMembershipRoles = new Set([
    'member',
    'honorary_member',
    'network_leader',
    'regional_leader',
    'national_leader',
    'network_guide',
  ]);

  const filteredActiveVotes = (activeVotes || []).filter((vote) => {
    if (!profile) return false;
    if (vote.is_election && vote.commandery_scope) {
      return profile.status === 'active'
        && profile.commandery_id === vote.commandery_scope
        && !!profile.membership_role
        && primariesAllowedMembershipRoles.has(profile.membership_role);
    }

    if (vote.commandery_scope) {
      return profile.status === 'active' && profile.commandery_id === vote.commandery_scope;
    }

    const eligibleRoles = (vote.eligible_roles || []) as string[];
    if (eligibleRoles.length === 0) return true;
    return (!!profile.role && eligibleRoles.includes(profile.role))
      || (!!profile.membership_role && eligibleRoles.includes(profile.membership_role));
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// ГОЛОСУВАННЯ</p>
        <div className="flex items-center gap-2">
          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">
            Прийняття рішень
          </h1>
          <HelpTooltip pageSlug="dashboard-votes" elementId="vote-list" position="right" />
        </div>
      </div>

      <VotesList activeVotes={filteredActiveVotes} closedVotes={closedVotes} />
    </div>
  );
}
