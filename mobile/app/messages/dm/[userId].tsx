import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';

export default function DmRedirectScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    api.messaging
      .dm(userId)
      .then(({ conversation }) => {
        const other = conversation.otherParticipant;
        const name = other
          ? encodeURIComponent(`${other.firstName} ${other.lastName}`.trim())
          : '';
        router.replace(`/messages/${conversation.id}${name ? `?name=${name}` : ''}`);
      })
      .catch((err) => {
        setError(err.message || 'Не вдалося створити чат');
        setTimeout(() => router.back(), 2000);
      });
  }, [userId]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#b5793a" />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0e10',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
});
