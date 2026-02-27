import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ImagePlus } from 'lucide-react-native';

interface CreatePostInputProps {
  onPress?: () => void;
}

export function CreatePostInput({ onPress }: CreatePostInputProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>Ви</Text>
      </View>
      <View style={styles.input}>
        <Text style={styles.placeholder}>Що у вас нового?</Text>
      </View>
      <Pressable style={styles.imageButton} onPress={onPress}>
        <ImagePlus size={24} color="#8b8f96" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141618',
    padding: 12,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#b5793a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    flex: 1,
    marginHorizontal: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0d0e10',
    borderRadius: 20,
  },
  placeholder: {
    color: '#8b8f96',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  imageButton: {
    padding: 8,
  },
});
