import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ImagePlus, X, Globe, Users, Lock } from 'lucide-react-native';

const visibilityOptions = [
  { key: 'public', label: 'Публічний', icon: Globe },
  { key: 'followers', label: 'Підписники', icon: Users },
  { key: 'private', label: 'Приватний', icon: Lock },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      api.posts.create({
        content,
        visibility,
        content_type: 'text',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Помилка', error.message || 'Не вдалося створити допис');
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Помилка', 'Введіть текст допису');
      return;
    }
    createMutation.mutate();
  };

  const SelectedIcon = visibilityOptions.find(v => v.key === visibility)?.icon || Globe;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <X size={24} color="#e7e7e7" />
        </Pressable>
        <Text style={styles.headerTitle}>Новий допис</Text>
        <Pressable
          style={[styles.postButton, !content.trim() && styles.postButtonDisabled]}
          onPress={handleSubmit}
          disabled={!content.trim() || createMutation.isPending}
        >
          <Text style={styles.postButtonText}>
            {createMutation.isPending ? 'Публікація...' : 'Опублікувати'}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Що у вас нового?"
          placeholderTextColor="#8b8f96"
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.mediaButton}>
          <ImagePlus size={24} color="#b5793a" />
          <Text style={styles.mediaButtonText}>Додати фото</Text>
        </Pressable>

        <Pressable
          style={styles.visibilityButton}
          onPress={() => setShowVisibilityOptions(!showVisibilityOptions)}
        >
          <SelectedIcon size={18} color="#8b8f96" />
          <Text style={styles.visibilityText}>
            {visibilityOptions.find(v => v.key === visibility)?.label}
          </Text>
        </Pressable>

        {showVisibilityOptions && (
          <View style={styles.visibilityOptions}>
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Pressable
                  key={option.key}
                  style={[
                    styles.visibilityOption,
                    visibility === option.key && styles.visibilityOptionActive,
                  ]}
                  onPress={() => {
                    setVisibility(option.key);
                    setShowVisibilityOptions(false);
                  }}
                >
                  <Icon
                    size={18}
                    color={visibility === option.key ? '#b5793a' : '#8b8f96'}
                  />
                  <Text
                    style={[
                      styles.visibilityOptionText,
                      visibility === option.key && styles.visibilityOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0e10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#141618',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  headerTitle: {
    color: '#e7e7e7',
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  postButton: {
    backgroundColor: '#b5793a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    color: '#e7e7e7',
    fontSize: 17,
    fontFamily: 'Inter_400Regular',
    minHeight: 200,
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: '#141618',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  mediaButtonText: {
    color: '#b5793a',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  visibilityText: {
    color: '#8b8f96',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  visibilityOptions: {
    marginTop: 12,
    gap: 8,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#0d0e10',
    borderRadius: 8,
  },
  visibilityOptionActive: {
    backgroundColor: 'rgba(181, 121, 58, 0.1)',
  },
  visibilityOptionText: {
    color: '#8b8f96',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  visibilityOptionTextActive: {
    color: '#b5793a',
    fontFamily: 'Inter_500Medium',
  },
});
