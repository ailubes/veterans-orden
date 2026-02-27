import { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MessageBubble } from '@/components/messaging/message-bubble';
import { ChatInput } from '@/components/messaging/chat-input';

export default function ChatScreen() {
  const { conversationId, name } = useLocalSearchParams<{ conversationId: string; name?: string }>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  // Set header title immediately from query param (passed by DM redirect)
  useEffect(() => {
    if (name) {
      navigation.setOptions({ title: decodeURIComponent(name) });
    }
  }, [name]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) =>
      api.messaging.messages(conversationId!, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    refetchInterval: 5000,
  });

  // All messages chronological (oldest first)
  const allMessages = data?.pages.flatMap((page) => page.messages) || [];
  // Inverted FlatList needs newest-first
  const inverted = [...allMessages].reverse();

  // Resolve current user id from cache
  const meData = queryClient.getQueryData<any>(['me']);
  const myUserId = meData?.id;

  // Update header title from conversation cache or messages once loaded
  useEffect(() => {
    if (name) return; // already set from query param
    const convCache = queryClient.getQueryData<any>(['conversations']);
    const conv = convCache?.conversations?.find((c: any) => c.id === conversationId);
    if (conv?.otherParticipant) {
      navigation.setOptions({
        title: `${conv.otherParticipant.firstName} ${conv.otherParticipant.lastName}`,
      });
      return;
    }
    if (allMessages.length > 0) {
      const otherMsg = allMessages.find(
        (m: any) => m.sender && m.senderId !== myUserId
      );
      if (otherMsg?.sender) {
        navigation.setOptions({
          title: `${otherMsg.sender.firstName} ${otherMsg.sender.lastName}`,
        });
      }
    }
  }, [data, conversationId, name]);

  // Mark last message as read
  useEffect(() => {
    if (allMessages.length > 0) {
      const lastMsg = allMessages[allMessages.length - 1];
      if (lastMsg?.id) {
        api.messaging.markRead(lastMsg.id).catch(() => {});
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    }
  }, [allMessages.length]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.messaging.sendMessage(conversationId!, content),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = useCallback(
    (content: string) => sendMutation.mutate(content),
    [sendMutation]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <MessageBubble message={item} isOwn={item.senderId === myUserId} />
    ),
    [myUserId]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b5793a" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
    >
      <FlatList
        ref={flatListRef}
        data={inverted}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#b5793a" style={styles.loadingMore} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Напишіть перше повідомлення</Text>
          </View>
        }
      />
      <ChatInput onSend={handleSend} disabled={sendMutation.isPending} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0e10',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0e10',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  loadingMore: {
    paddingVertical: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#8b8f96',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
});
