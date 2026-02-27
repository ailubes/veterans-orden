import { View, Text, StyleSheet } from 'react-native';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  if (message.type === 'system') {
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  const isDeleted = message.isDeleted;

  if (isOwn) {
    return (
      <View style={styles.rowOwn}>
        <View style={styles.bubbleOwn}>
          <Text style={[styles.content, isDeleted && styles.deletedText]}>
            {isDeleted ? 'Видалено' : message.content}
          </Text>
          <View style={styles.meta}>
            {message.isEdited && <Text style={styles.editedLabel}>ред.</Text>}
            <Text style={styles.timeOwn}>{formatTime(message.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  }

  const initials = message.sender
    ? getInitials(message.sender.firstName, message.sender.lastName)
    : '?';

  return (
    <View style={styles.rowOther}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Bubble with name on same line as avatar top */}
      <View style={styles.bubbleOtherWrap}>
        {message.sender && (
          <Text style={styles.senderName} numberOfLines={1}>
            {message.sender.firstName} {message.sender.lastName}
          </Text>
        )}
        <View style={styles.bubbleOther}>
          <Text style={[styles.content, isDeleted && styles.deletedText]}>
            {isDeleted ? 'Видалено' : message.content}
          </Text>
          <View style={styles.meta}>
            {message.isEdited && <Text style={styles.editedLabel}>ред.</Text>}
            <Text style={styles.timeOther}>{formatTime(message.createdAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Own messages — right-aligned, no avatar
  rowOwn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  bubbleOwn: {
    maxWidth: '75%',
    backgroundColor: 'rgba(181,121,58,0.18)',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  // Other messages — avatar + name on same line, bubble below name
  rowOther: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2d32',
    borderWidth: 1,
    borderColor: '#1a1d20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  avatarText: {
    color: '#b5793a',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  bubbleOtherWrap: {
    flex: 1,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  senderName: {
    color: '#b5793a',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginBottom: 3,
  },
  bubbleOther: {
    backgroundColor: '#1a1d20',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },

  // Shared content styles
  content: {
    color: '#e7e7e7',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  deletedText: {
    fontStyle: 'italic',
    color: '#8b8f96',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  editedLabel: {
    color: '#8b8f96',
    fontSize: 11,
    fontStyle: 'italic',
  },
  timeOwn: {
    color: 'rgba(181,121,58,0.7)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  timeOther: {
    color: '#8b8f96',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },

  // System message
  systemContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  systemText: {
    color: '#8b8f96',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
});
