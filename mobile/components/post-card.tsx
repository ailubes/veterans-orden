import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    content_type: string;
    media_urls?: string[];
    created_at: string;
    is_edited?: boolean;
    author: {
      id: string;
      display_name: string;
      avatar_url?: string;
      military_unit?: string;
      position?: string;
    };
    likes_count: number;
    comments_count: number;
    user_liked?: boolean;
    user_reaction?: string | null;
  };
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function PostCard({
  post,
  onPress,
  onLike,
  onComment,
  onShare,
  showActions = true,
}: PostCardProps) {
  const router = useRouter();

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: uk,
  });

  const handleAuthorPress = () => {
    router.push(`/user/${post.author.id}`);
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Author Header */}
      <View style={styles.header}>
        <Pressable onPress={handleAuthorPress} style={styles.authorContainer}>
          {post.author.avatar_url ? (
            <Image source={{ uri: post.author.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {post.author.display_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.author.display_name}</Text>
            {(post.author.military_unit || post.author.position) && (
              <Text style={styles.authorMeta}>
                {post.author.position}
                {post.author.position && post.author.military_unit && ' • '}
                {post.author.military_unit}
              </Text>
            )}
          </View>
        </Pressable>
        <Text style={styles.timestamp}>
          {timeAgo}
          {post.is_edited && ' (ред.)'}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.text}>{post.content}</Text>

        {post.media_urls && post.media_urls.length > 0 && (
          <View style={styles.mediaContainer}>
            {post.media_urls.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={onLike}>
            <Heart
              size={20}
              color={post.user_liked ? '#b5793a' : '#8b8f96'}
              fill={post.user_liked ? '#b5793a' : 'transparent'}
            />
            <Text style={[styles.actionText, post.user_liked && styles.actionTextActive]}>
              {post.likes_count || 'Подобається'}
            </Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={onComment}>
            <MessageCircle size={20} color="#8b8f96" />
            <Text style={styles.actionText}>
              {post.comments_count || 'Коментарі'}
            </Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={onShare}>
            <Share2 size={20} color="#8b8f96" />
          </Pressable>

          <Pressable style={[styles.actionButton, styles.moreButton]}>
            <MoreHorizontal size={20} color="#8b8f96" />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141618',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#b5793a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    color: '#e7e7e7',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  authorMeta: {
    color: '#8b8f96',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  timestamp: {
    color: '#8b8f96',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  content: {
    marginBottom: 12,
  },
  text: {
    color: '#e7e7e7',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#0d0e10',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    paddingTop: 12,
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#8b8f96',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  actionTextActive: {
    color: '#b5793a',
  },
  moreButton: {
    marginLeft: 'auto',
  },
});
