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
import { Eye, EyeOff } from 'lucide-react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Помилка', 'Введіть email та пароль');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Помилка входу', error.message);
      } else {
        router.replace('/(tabs)');
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
            Вхід до кабінету
          </Text>
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-panel-850" />
          <View className="w-1.5 h-1.5 bg-bronze rounded-full mx-3" />
          <View className="flex-1 h-px bg-panel-850" />
        </View>

        {/* Form */}
        <View className="space-y-3">
          <TextInput
            className="bg-panel-900 border border-panel-850 text-text-100 font-inter px-4 py-3 rounded-lg text-sm"
            placeholder="Email"
            placeholderTextColor="#555a63"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View className="relative">
            <TextInput
              className="bg-panel-900 border border-panel-850 text-text-100 font-inter px-4 py-3 pr-12 rounded-lg text-sm"
              placeholder="Пароль"
              placeholderTextColor="#555a63"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              activeOpacity={1}
            >
              {showPassword ? (
                <EyeOff size={20} color="#555a63" />
              ) : (
                <Eye size={20} color="#555a63" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/reset-password')}
          className="items-end mt-2.5 mb-6"
        >
          <Text className="text-bronze font-inter text-xs opacity-80">
            Забули пароль?
          </Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          className="bg-bronze rounded-lg py-3 items-center"
          activeOpacity={1}
        >
          {loading ? (
            <ActivityIndicator color="#0f1011" size="small" />
          ) : (
            <Text className="text-bg-950 font-inter-bold text-xs tracking-widest uppercase">
              Увійти
            </Text>
          )}
        </TouchableOpacity>

        {/* Bottom link */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/sign-up')}
          className="mt-8 items-center"
        >
          <Text className="text-muted-500 font-inter text-xs text-center">
            Ще не маєте акаунту?{'  '}
            <Text className="text-bronze">Зареєструватись</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
