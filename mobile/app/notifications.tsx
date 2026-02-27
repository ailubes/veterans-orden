import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications.list,
  });

  const markReadMutation = useMutation({
    mutationFn: api.notifications.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications || [];

  return (
    <ScrollView
      className="flex-1 bg-bg-950"
      contentContainerClassName="p-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#b5793a" />}
    >
      <Text className="text-bronze font-mono text-xs tracking-widest mb-2">// ПОВІДОМЛЕННЯ</Text>
      <Text className="text-text-100 text-2xl font-inter-black mb-6">Сповіщення</Text>

      {isLoading ? (
        <ActivityIndicator color="#b5793a" className="mt-8" />
      ) : notifications.length === 0 ? (
        <Text className="text-muted-500 text-sm font-inter text-center mt-8">Немає повідомлень</Text>
      ) : (
        <View className="space-y-2">
          {notifications.map((n: any) => (
            <TouchableOpacity activeOpacity={1}
              key={n.id}
              onPress={() => !n.isRead && markReadMutation.mutate(n.id)}
              className={`rounded-lg p-4 border ${n.isRead ? 'bg-panel-900 border-panel-850' : 'bg-bronze/5 border-bronze/30'}`}
            >
              <View className="flex-row items-start justify-between mb-1">
                <Text className={`font-inter-bold text-sm flex-1 mr-3 ${n.isRead ? 'text-muted-500' : 'text-text-100'}`}>
                  {n.title}
                </Text>
                {!n.isRead && (
                  <View className="w-2 h-2 rounded-full bg-bronze mt-1.5 flex-shrink-0" />
                )}
              </View>
              {n.message && (
                <Text className="text-muted-500 text-xs font-inter leading-relaxed mb-2">{n.message}</Text>
              )}
              <Text className="text-muted-500 text-xs font-inter">
                {n.deliveredAt ? formatDistanceToNow(new Date(n.deliveredAt), { addSuffix: true, locale: uk }) : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
