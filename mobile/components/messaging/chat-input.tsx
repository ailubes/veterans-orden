import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SendHorizontal } from 'lucide-react-native';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Повідомлення..."
        placeholderTextColor="#8b8f96"
        multiline
        maxLength={4000}
        editable={!disabled}
        textAlignVertical="center"
      />
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.sendButton, canSend && styles.sendButtonActive]}
        onPress={handleSend}
        disabled={!canSend}
      >
        <SendHorizontal size={20} color={canSend ? '#0f1011' : '#4a4d52'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#141618',
    borderTopWidth: 1,
    borderTopColor: '#1a1d20',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f1011',
    borderWidth: 1,
    borderColor: '#1a1d20',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: '#e7e7e7',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    minHeight: 48,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1d20',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendButtonActive: {
    backgroundColor: '#b5793a',
  },
});
