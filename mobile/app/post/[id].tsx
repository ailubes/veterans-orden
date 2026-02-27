import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PostCard } from '@/components/post-card';
import { Send } from 'lucide-react-native';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.posts.get(id as string),
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => api.comments.list(id as string),
  });

  const likeMutation = useMutation({
    mutationFn: ({ liked }: { liked: boolean }) =>
      liked ? api.posts.unlike(id as string) : api.posts.like(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.comments.create(id as string, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setCommentText('');
    },
  });

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  if (postLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b5793a" />
      </View>
    );
  }

  const post = postData?.post;
  const comments = commentsData?.comments || [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {post && (
          <PostCard
            post={post}
            showActions={false}
            onLike={() => likeMutation.mutate({ liked: post.user_liked })}
          />
        )}

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Коментарі ({post?.comments_count || 0})
          </Text>

          {commentsLoading ? (
            <ActivityIndicator size="small" color="#b5793a" />
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>Поки немає коментарів. Будьте першим!</Text>
          ) : (
            comments.map((comment: any) => (
              <View key={comment.id} style={styles.commentCard}>
                <Text style={styles.commentAuthor}>
                  {comment.author?.display_name || 'Користувач'}
                </Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTime}>
                  {new Date(comment.created_at).toLocaleDateString('uk-UA')}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Написати коментар..."
          placeholderTextColor="#8b8f96"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <Pressable
          style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || commentMutation.isPending}
        >
          <Send size={20} color={commentText.trim() ? '#b5793a' : '#8b8f96'} />
        </Pressable>
      </View>
    </View>
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
  scrollView: {
    flex: 1,
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    color: '#e7e7e7',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
  },
  noComments: {
    color: '#8b8f96',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  commentCard: {
    backgroundColor: '#141618',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    color: '#b5793a',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  commentText: {
    color: '#e7e7e7',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  commentTime: {
    color: '#8b8f96',
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#141618',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  input: {
    flex: 1,
    backgroundColor: '#0d0e10',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#e7e7e7',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
