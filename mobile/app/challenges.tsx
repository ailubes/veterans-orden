import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function ChallengesScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['challenges'],
    queryFn: api.challenges.getAll,
  });

  const challenges = data?.challenges || [];

  return (
    <ScrollView
      className="flex-1 bg-bg-950"
      contentContainerClassName="p-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#b5793a" />}
    >
      <Text className="text-bronze font-mono text-xs tracking-widest mb-2">// ВИКЛИКИ</Text>
      <Text className="text-text-100 text-2xl font-inter-black mb-6">Виклики</Text>

      {isLoading ? (
        <ActivityIndicator color="#b5793a" className="mt-8" />
      ) : challenges.length === 0 ? (
        <Text className="text-muted-500 text-sm font-inter text-center mt-8">Викликів немає</Text>
      ) : (
        <View className="space-y-3">
          {challenges.map((challenge: any) => (
            <View
              key={challenge.id}
              className="bg-panel-850 rounded-lg p-4"
              style={{ borderWidth: 1, borderColor: 'rgba(181,121,58,0.20)' }}
            >
              <Text className="text-text-100 font-inter-bold text-base mb-1">{challenge.title}</Text>
              {challenge.description ? (
                <Text className="text-muted-500 text-sm font-inter mb-2">{challenge.description}</Text>
              ) : null}
              <View className="flex-row items-center justify-between">
                <Text className="text-bronze text-xs font-mono">
                  {challenge.points_reward ? `+${challenge.points_reward} балів` : ''}
                </Text>
                <Text className="text-muted-500 text-xs font-inter">{challenge.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
