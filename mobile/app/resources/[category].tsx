import { View, Text, ScrollView, TouchableOpacity, Linking, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const CATEGORY_LABELS: Record<string, string> = {
  jobs: 'Зайнятість',
  legal: 'Правова допомога',
  support: 'Психологічна підтримка',
  healthcare: 'Охорона здоров\'я',
};

export default function ResourceCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['resources', category],
    queryFn: () => api.resources.list(category),
  });

  const resources = data?.resources || [];

  return (
    <ScrollView
      className="flex-1 bg-bg-950"
      contentContainerClassName="p-4"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#b5793a" />}
    >
      <Text className="text-bronze font-mono text-xs tracking-widest mb-2">
        // {CATEGORY_LABELS[category!]?.toUpperCase() || 'РЕСУРСИ'}
      </Text>
      <Text className="text-text-100 text-2xl font-inter-black mb-6">
        {CATEGORY_LABELS[category!] || 'Ресурси'}
      </Text>

      {category === 'support' && (
        <TouchableOpacity activeOpacity={1}
          onPress={() => Linking.openURL('tel:1565')}
          className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 mb-4 flex-row items-center gap-3"
        >
          <Text className="text-rose-400 text-2xl">📞</Text>
          <View>
            <Text className="text-text-100 font-inter-bold text-sm">Термінова допомога</Text>
            <Text className="text-rose-400 text-xs font-inter mt-0.5">Зателефонувати: 1565 (цілодобово)</Text>
          </View>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <ActivityIndicator color="#b5793a" className="mt-8" />
      ) : resources.length === 0 ? (
        <Text className="text-muted-500 text-sm font-inter text-center mt-8">Ресурсів поки немає</Text>
      ) : (
        <View className="space-y-3">
          {resources.map((resource: any) => (
            <View key={resource.id} className="bg-panel-900 border border-panel-850 rounded-lg p-4">
              <View className="flex-row items-start justify-between gap-3 mb-2">
                <Text className="text-text-100 font-inter-bold text-sm flex-1 leading-tight">
                  {resource.title}
                </Text>
                {resource.is_free && (
                  <View className="bg-green-500/10 px-2 py-0.5 rounded">
                    <Text className="text-green-400 text-xs font-mono-bold">Безоплатно</Text>
                  </View>
                )}
              </View>

              {resource.description && (
                <Text className="text-muted-500 text-xs font-inter mb-3 leading-relaxed">
                  {resource.description}
                </Text>
              )}

              {resource.region && resource.region !== 'national' && (
                <Text className="text-muted-500 text-xs font-inter mb-2">📍 {resource.region}</Text>
              )}

              {resource.contact && (
                <TouchableOpacity activeOpacity={1}
                  onPress={() => {
                    const url = resource.contact.startsWith('http')
                      ? resource.contact
                      : `tel:${resource.contact}`;
                    Linking.openURL(url);
                  }}
                >
                  <Text className="text-bronze text-xs font-inter-bold">
                    {resource.contact.startsWith('http') ? '🔗 Перейти на сайт' : `📞 ${resource.contact}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
