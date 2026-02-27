import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { PostCard } from '@/components/post-card';
import { CreatePostInput } from '@/components/create-post-input';
import { FeedFilter } from '@/components/feed-filter';
import { ArrowUp } from 'lucide-react-native';
import { TopAppBar } from '@/components/top-app-bar';

export default function FeedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'following' | 'popular'>('all');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', filter],
    queryFn: ({ pageParam }) => api.posts.list(pageParam, 20, filter === 'all' ? 'all' : filter),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  const deleteMutation = useMutation({
    mutationFn: api.posts.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ id, liked, reaction_type }: { id: string; liked: boolean; reaction_type?: string }) =>
      liked ? api.posts.unlike(id) : api.posts.like(id, reaction_type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderPost = useCallback(({ item }: { item: any }) => (
    <PostCard
      post={item}
      onPress={() => router.push(`/post/${item.id}`)}
      onLike={() => likeMutation.mutate({ id: item.id, liked: item.user_liked })}
      onComment={() => router.push(`/post/${item.id}`)}
      onDelete={() => deleteMutation.mutate(item.id)}
    />
  ), [router, deleteMutation, likeMutation]);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#b5793a" />
      </View>
    );
  };

  const scrollToTop = () => {
    // FlatList would need a ref to scroll
    refetch();
  };

  return (
    <View style={styles.container}>
      <TopAppBar title="Стрічка" />
      <FeedFilter filter={filter} onChange={setFilter} />
      <CreatePostInput onPress={() => router.push('/post/create')} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#b5793a" />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {showScrollTop && (
        <Pressable style={styles.scrollTopButton} onPress={scrollToTop}>
          <ArrowUp size={24} color="#e7e7e7" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0e10',
  },
  list: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#b5793a',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
