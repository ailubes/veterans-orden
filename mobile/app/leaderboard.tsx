import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';

async function fetchLeaderboard() {
  const APP_URL = process.env.EXPO_PUBLIC_APP_URL;
  const { supabase } = await import('@/lib/supabase');
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${APP_URL}/api/leaderboard`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  return res.json();
}

export default function LeaderboardScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
  });

  const entries = data?.leaderboard || [];

  return (
    <ScrollView
      className="flex-1 bg-bg-950"
      contentContainerClassName="p-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#b5793a" />}
    >
      <Text className="text-bronze font-mono text-xs tracking-widest mb-2">// РЕЙТИНГ</Text>
      <Text className="text-text-100 text-2xl font-inter-black mb-6">Рейтинг учасників</Text>

      {isLoading ? (
        <ActivityIndicator color="#b5793a" className="mt-8" />
      ) : (
        <View className="space-y-2">
          {entries.map((entry: any, index: number) => (
            <View
              key={entry.userId || String(index)}
              className="flex-row items-center p-4 rounded-lg border"
              style={
                index === 0
                  ? { backgroundColor: 'rgba(181,121,58,0.10)', borderColor: 'rgba(181,121,58,0.30)' }
                  : { backgroundColor: '#141618', borderColor: index < 3 ? 'rgba(26,29,32,0.6)' : '#1a1d20' }
              }
            >
              <Text className={`text-lg font-inter-bold w-8 ${index < 3 ? 'text-bronze' : 'text-muted-500'}`}>
                {entry.rank || index + 1}
              </Text>
              <View className="flex-1">
                <Text className="text-text-100 font-inter-bold text-sm">
                  {entry.firstName} {entry.lastName}
                </Text>
              </View>
              <Text className="text-bronze font-inter-bold">{entry.value}</Text>
              <Text className="text-muted-500 text-xs font-inter ml-1">балів</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
