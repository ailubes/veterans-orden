import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TopAppBar } from '@/components/top-app-bar';

export default function EventsScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: api.events.list,
  });

  const rsvpMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'going' | 'maybe' | 'not_going' }) =>
      api.events.rsvp(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    onError: () => Alert.alert('Помилка', 'Не вдалося зареєструватись'),
  });

  const events = data?.events || [];

  return (
    <View className="flex-1 bg-bg-950">
      <TopAppBar title="Події" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#b5793a" />}
      >
        <Text className="text-text-100 text-2xl font-inter-black mb-6">Найближчі події</Text>

      {events.length === 0 && !isLoading && (
        <Text className="text-muted-500 text-sm font-inter text-center mt-8">Немає найближчих подій</Text>
      )}

      <View className="space-y-3">
        {events.map((event: any) => (
          <View key={event.id} className="bg-panel-900 border border-panel-850 rounded-lg p-4">
            <Text className="text-text-100 font-inter-bold mb-1">{event.title}</Text>
            <Text className="text-muted-500 text-xs font-inter mb-3">
              {new Date(event.start_date).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {event.description && (
              <Text className="text-muted-500 text-xs font-inter leading-relaxed mb-3" numberOfLines={2}>
                {event.description}
              </Text>
            )}
            <View className="flex-row gap-2">
              <TouchableOpacity activeOpacity={1}
                onPress={() => rsvpMutation.mutate({ id: event.id, status: 'going' })}
                className="flex-1 bg-bronze rounded py-2 items-center"
              >
                <Text className="text-bg-950 font-inter-bold text-xs">БУДУ</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1}
                onPress={() => rsvpMutation.mutate({ id: event.id, status: 'maybe' })}
                className="flex-1 border border-line rounded py-2 items-center"
              >
                <Text className="text-muted-500 text-xs font-inter">МОЖЛИВО</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      </ScrollView>
    </View>
  );
}
