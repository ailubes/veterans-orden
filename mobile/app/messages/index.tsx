import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Search, MessageCircle } from 'lucide-react-native';
import { api } from '@/lib/api';
import { ConversationItem } from '@/components/messaging/conversation-item';

export default function ConversationsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.messaging.conversations(),
    refetchInterval: 15000,
  });

  const conversations = data?.conversations || [];

  const filtered = search.trim()
    ? conversations.filter((c: any) => {
        const name = c.otherParticipant
          ? `${c.otherParticipant.firstName} ${c.otherParticipant.lastName}`
          : c.name || '';
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : conversations;

  const handlePress = useCallback(
    (conversationId: string, conversation: any) => {
      const other = conversation.otherParticipant;
      const name = other
        ? encodeURIComponent(`${other.firstName} ${other.lastName}`.trim())
        : '';
      router.push(`/messages/${conversationId}${name ? `?name=${name}` : ''}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <ConversationItem
        conversation={item}
        onPress={() => handlePress(item.id, item)}
      />
    ),
    [handlePress]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b5793a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>// ПОВІДОМЛЕННЯ</Text>
        <Text style={styles.title}>Повідомлення</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={16} color="#8b8f96" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Пошук розмов..."
          placeholderTextColor="#8b8f96"
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#b5793a"
            colors={['#b5793a']}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MessageCircle size={40} color="#b5793a" />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? 'Нічого не знайдено' : 'Немає повідомлень'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? 'Спробуйте інший запит'
                : 'Знайдіть учасника у Спільноті та напишіть йому'}
            </Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1011',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f1011',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  label: {
    color: '#b5793a',
    fontSize: 11,
    fontFamily: 'IBMPlexMono_400Regular',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: '#e7e7e7',
    fontSize: 26,
    fontFamily: 'Inter_900Black',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141618',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1a1d20',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: '#e7e7e7',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginLeft: 8,
    paddingVertical: 0,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(181,121,58,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#e7e7e7',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#8b8f96',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
});
