import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function PointsScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['points'],
    queryFn: api.me.getPoints,
  });

  const balance = data?.balance;
  const history = data?.history?.transactions || [];

  return (
    <ScrollView
      className="flex-1 bg-bg-950"
      contentContainerClassName="p-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#b5793a" />}
    >
      <Text className="text-bronze font-mono text-xs tracking-widest mb-2">// МОЇ БАЛИ</Text>
      <Text className="text-text-100 text-2xl font-inter-black mb-6">Мої бали</Text>

      {isLoading ? (
        <ActivityIndicator color="#b5793a" className="mt-8" />
      ) : (
        <>
          {/* Balance Card */}
          <View className="bg-panel-850 rounded-lg p-5 mb-6" style={{ borderWidth: 1, borderColor: 'rgba(181,121,58,0.20)' }}>
            <Text className="text-bronze text-xs font-mono-bold tracking-wider mb-3">ЗАГАЛЬНИЙ БАЛАНС</Text>
            <Text className="text-text-100 text-4xl font-inter-black mb-1">{balance?.total || 0}</Text>
            <Text className="text-muted-500 text-sm font-inter">балів</Text>
          </View>

          {/* Transaction History */}
          <Text className="text-text-100 font-inter-bold text-lg mb-3">Історія транзакцій</Text>
          {history.length === 0 ? (
            <Text className="text-muted-500 text-sm font-inter text-center mt-4">Транзакцій немає</Text>
          ) : (
            <View className="space-y-2">
              {history.map((tx: any) => (
                <View
                  key={tx.id}
                  className="bg-panel-900 border border-panel-850 rounded-lg p-4 flex-row items-center gap-3"
                >
                  <View className={`w-2 h-2 rounded-full ${tx.amount > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                  <View className="flex-1">
                    <Text className="text-text-100 text-sm font-inter">{tx.description || tx.type}</Text>
                    <Text className="text-muted-500 text-xs font-inter mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString('uk-UA')}
                    </Text>
                  </View>
                  <Text className={`font-inter-bold text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
