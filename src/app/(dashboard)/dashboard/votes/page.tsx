import { createClient } from '@/lib/supabase/server';
import VotesList from '@/components/votes/votes-list';

export default async function VotesPage() {
  const supabase = await createClient();

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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// ГОЛОСУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">
          Прийняття рішень
        </h1>
      </div>

      <VotesList activeVotes={activeVotes} closedVotes={closedVotes} />
    </div>
  );
}
