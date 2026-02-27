import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PostCard } from '@/components/post-card';
import { UserPlus, UserCheck, MapPin, Briefcase, MessageCircle } from 'lucide-react-native';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => api.users.get(id as string),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['users', id, 'posts'],
    queryFn: () => api.users.posts(id as string),
    enabled: activeTab === 'posts',
  });

  const followMutation = useMutation({
    mutationFn: () => {
      const isFollowing = profileData?.profile?.is_following;
      return isFollowing
        ? api.follows.unfollow(id as string)
        : api.follows.follow(id as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });

  if (profileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b5793a" />
      </View>
    );
  }

  const profile = profileData?.profile;
  const posts = postsData?.posts || [];

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Користувача не знайдено</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header / Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(profile.display_name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{profile.display_name}</Text>

        {(profile.military_unit || profile.position) && (
          <Text style={styles.meta}>
            {profile.position}
            {profile.position && profile.military_unit && ' • '}
            {profile.military_unit}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.posts_count || 0}</Text>
            <Text style={styles.statLabel}>Дописи</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Підписники</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.following_count || 0}</Text>
            <Text style={styles.statLabel}>Підписки</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[
              styles.followButton,
              profile.is_following && styles.followButtonActive,
            ]}
            onPress={() => followMutation.mutate()}
            disabled={followMutation.isPending}
          >
            {profile.is_following ? (
              <>
                <UserCheck size={18} color="#b5793a" />
                <Text style={styles.followButtonTextActive}>Підписані</Text>
              </>
            ) : (
              <>
                <UserPlus size={18} color="#fff" />
                <Text style={styles.followButtonText}>Підписатися</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.messageButton}
            onPress={() => router.push(`/messages/dm/${id}`)}
          >
            <MessageCircle size={18} color="#e7e7e7" />
            <Text style={styles.messageButtonText}>Повідомлення</Text>
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
            Дописи
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'about' && styles.tabActive]}
          onPress={() => setActiveTab('about')}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
            Про мене
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'posts' ? (
        postsLoading ? (
          <ActivityIndicator size="small" color="#b5793a" style={styles.loader} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Ще немає дописів</Text>
          </View>
        ) : (
          posts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              onPress={() => router.push(`/post/${post.id}`)}
            />
          ))
        )
      ) : (
        <View style={styles.aboutSection}>
          {profile.bio && (
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Про себе</Text>
              <Text style={styles.aboutValue}>{profile.bio}</Text>
            </View>
          )}
          {profile.city && (
            <View style={styles.aboutItem}>
              <MapPin size={16} color="#8b8f96" />
              <Text style={styles.aboutValue}>{profile.city}</Text>
            </View>
          )}
          {profile.profession && (
            <View style={styles.aboutItem}>
              <Briefcase size={16} color="#8b8f96" />
              <Text style={styles.aboutValue}>{profile.profession}</Text>
            </View>
          )}
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Приєднався</Text>
            <Text style={styles.aboutValue}>
              {new Date(profile.created_at).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
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
  errorText: {
    color: '#8b8f96',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#141618',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#b5793a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
  },
  name: {
    color: '#e7e7e7',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  meta: {
    color: '#8b8f96',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#e7e7e7',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    color: '#8b8f96',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#b5793a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followButtonActive: {
    backgroundColor: 'rgba(181, 121, 58, 0.2)',
    borderWidth: 1,
    borderColor: '#b5793a',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  followButtonTextActive: {
    color: '#b5793a',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0d0e10',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageButtonText: {
    color: '#e7e7e7',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#141618',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#b5793a',
  },
  tabText: {
    color: '#8b8f96',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  tabTextActive: {
    color: '#e7e7e7',
  },
  loader: {
    marginTop: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8b8f96',
    fontSize: 14,
  },
  aboutSection: {
    padding: 16,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  aboutLabel: {
    color: '#8b8f96',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  aboutValue: {
    color: '#e7e7e7',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
});
