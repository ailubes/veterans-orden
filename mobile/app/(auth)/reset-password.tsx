import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email) {
      Alert.alert('Помилка', 'Введіть email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'orden://reset-password',
      });
      if (error) {
        Alert.alert('Помилка', error.message);
      } else {
        setSent(true);
      }
    } catch {
      Alert.alert('Помилка', 'Щось пішло не так');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-8 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <Image
            source={require('@/assets/images/logo.png')}
            className="w-24 h-24 mb-4"
            resizeMode="contain"
          />
          <Text className="text-bronze font-mono text-xs tracking-widest mb-3 opacity-70">
            // ОРДЕН ВЕТЕРАНІВ
          </Text>
          <Text className="text-text-100 font-inter-black text-2xl text-center tracking-tight">
            Скинути пароль
          </Text>
          {!sent && (
            <Text className="text-muted-500 font-inter text-xs text-center mt-2 leading-relaxed max-w-xs">
              Введіть email і ми надішлемо посилання для скидання пароля.
            </Text>
          )}
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-panel-850" />
          <View className="w-1.5 h-1.5 bg-bronze rounded-full mx-3" />
          <View className="flex-1 h-px bg-panel-850" />
        </View>

        {sent ? (
          /* Success state */
          <View className="items-center">
            <View className="w-10 h-10 bg-bronze/20 rounded-full items-center justify-center mb-4">
              <Text className="text-bronze font-inter-black text-base">✓</Text>
            </View>
            <Text className="text-text-100 font-inter-bold text-sm text-center mb-2">
              Лист надіслано
            </Text>
            <Text className="text-muted-500 font-inter text-xs text-center leading-relaxed max-w-xs">
              Перевірте пошту {email} і перейдіть за посиланням для скидання пароля.
            </Text>
          </View>
        ) : (
          /* Form state */
          <View>
            <TextInput
              className="bg-panel-900 border border-panel-850 text-text-100 font-inter px-4 py-3 rounded-lg text-sm"
              placeholder="Email"
              placeholderTextColor="#555a63"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              className="bg-bronze rounded-lg py-3 items-center mt-4"
              activeOpacity={1}
            >
              {loading ? (
                <ActivityIndicator color="#0f1011" size="small" />
              ) : (
                <Text className="text-bg-950 font-inter-bold text-xs tracking-widest uppercase">
                  Надіслати посилання
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom link */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/sign-in')}
          className="mt-10 items-center"
        >
          <Text className="text-muted-500 font-inter text-xs text-center">
            Повернутись до{' '}
            <Text className="text-bronze">входу</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
