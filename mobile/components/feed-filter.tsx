import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

type FilterType = 'all' | 'following' | 'popular';

interface FeedFilterProps {
  filter: FilterType;
  onChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Усі' },
  { key: 'following', label: 'Підписки' },
  { key: 'popular', label: 'Популярні' },
];

export function FeedFilter({ filter, onChange }: FeedFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {filters.map((f) => (
        <Pressable
          key={f.key}
          style={[styles.button, filter === f.key && styles.buttonActive]}
          onPress={() => onChange(f.key)}
        >
          <Text style={[styles.text, filter === f.key && styles.textActive]}>
            {f.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141618',
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0d0e10',
  },
  buttonActive: {
    backgroundColor: '#b5793a',
  },
  text: {
    color: '#8b8f96',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  textActive: {
    color: '#fff',
  },
});
