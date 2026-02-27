import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { UserPlus, UserCheck } from 'lucide-react-native';

interface UserCardProps {
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
    military_unit?: string;
    position?: string;
    city?: string;
    profession?: string;
    bio?: string;
    is_following?: boolean;
  };
  onPress?: () => void;
  showFollowButton?: boolean;
}

export function UserCard({
  user,
  onPress,
  showFollowButton = true,
}: UserCardProps) {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () =>
      user.is_following ? api.follows.unfollow(user.id) : api.follows.follow(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      queryClient.invalidateQueries({ queryKey: ['users', user.id] });
    },
  });

  const handleFollow = (e: any) => {
    e.stopPropagation();
    followMutation.mutate();
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {user.avatar_url ? (
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user.display_name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{user.display_name}</Text>
        {(user.military_unit || user.position) && (
          <Text style={styles.meta}>
            {user.position}
            {user.position && user.military_unit && ' • '}
            {user.military_unit}
          </Text>
        )}
        {(user.city || user.profession) && (
          <Text style={styles.location}>
            {user.city}
            {user.city && user.profession && ' • '}
            {user.profession}
          </Text>
        )}
        {user.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {user.bio}
          </Text>
        )}
      </View>

      {showFollowButton && (
        <Pressable
          style={[styles.followButton, user.is_following && styles.followButtonActive]}
          onPress={handleFollow}
          disabled={followMutation.isPending}
        >
          {user.is_following ? (
            <UserCheck size={20} color="#b5793a" />
          ) : (
            <UserPlus size={20} color="#8b8f96" />
          )}
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141618',
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#b5793a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#e7e7e7',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  meta: {
    color: '#8b8f96',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  location: {
    color: '#8b8f96',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  bio: {
    color: '#8b8f96',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    lineHeight: 18,
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0d0e10',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  followButtonActive: {
    backgroundColor: 'rgba(181, 121, 58, 0.2)',
  },
});
