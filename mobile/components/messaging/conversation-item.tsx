import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ConversationItemProps {
  conversation: any;
  onPress: () => void;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Вчора';
  if (days < 7) return date.toLocaleDateString('uk-UA', { weekday: 'short' });
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
}

export function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const other = conversation.otherParticipant;
  const displayName = other
    ? `${other.firstName} ${other.lastName}`.trim()
    : conversation.name || 'Чат';
  const initials = other
    ? getInitials(other.firstName, other.lastName)
    : conversation.name?.charAt(0)?.toUpperCase() || '?';
  const unread = conversation.unreadCount || 0;

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name + time on the same row */}
        <View style={styles.topRow}>
          <Text style={[styles.name, unread > 0 && styles.nameBold]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.time}>{formatTime(conversation.lastMessageAt)}</Text>
        </View>

        {/* Preview + unread badge */}
        <View style={styles.bottomRow}>
          <Text
            style={[styles.preview, unread > 0 && styles.previewUnread]}
            numberOfLines={1}
          >
            {conversation.lastMessagePreview || 'Немає повідомлень'}
          </Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f1011',
    borderBottomWidth: 1,
    borderBottomColor: '#141618',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1d20',
    borderWidth: 1,
    borderColor: '#2a2d32',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: {
    color: '#b5793a',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: {
    flex: 1,
    color: '#e7e7e7',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginRight: 8,
  },
  nameBold: {
    fontFamily: 'Inter_700Bold',
  },
  time: {
    color: '#8b8f96',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flexShrink: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    color: '#8b8f96',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginRight: 8,
  },
  previewUnread: {
    color: '#c0c4cc',
    fontFamily: 'Inter_700Bold',
  },
  badge: {
    backgroundColor: '#b5793a',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    flexShrink: 0,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
});
