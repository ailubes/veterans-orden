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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Помилка', 'Заповніть усі поля');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Помилка', 'Паролі не збігаються');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Помилка', 'Пароль має бути не менше 8 символів');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Помилка реєстрації', error.message);
      } else {
        Alert.alert(
          'Перевірте пошту',
          'Ми надіслали лист для підтвердження. Після підтвердження ви зможете увійти.',
          [{ text: 'Добре', onPress: () => router.replace('/(auth)/sign-in') }]
        );
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
            Створити акаунт
          </Text>
          <Text className="text-muted-500 font-inter text-xs text-center mt-2 leading-relaxed max-w-xs">
            Реєстрація для ветеранів, військовослужбовців, волонтерів, благодійників та активних громадян.
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
              placeholder="Пароль (мінімум 8 символів)"
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
          <View className="relative">
            <TextInput
              className="bg-panel-900 border border-panel-850 text-text-100 font-inter px-4 py-3 pr-12 rounded-lg text-sm"
              placeholder="Підтвердження пароля"
              placeholderTextColor="#555a63"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              activeOpacity={1}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#555a63" />
              ) : (
                <Eye size={20} color="#555a63" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSignUp}
          disabled={loading}
          className="bg-bronze rounded-lg py-3 items-center mt-6"
          activeOpacity={1}
        >
          {loading ? (
            <ActivityIndicator color="#0f1011" size="small" />
          ) : (
            <Text className="text-bg-950 font-inter-bold text-xs tracking-widest uppercase">
              Зареєструватись
            </Text>
          )}
        </TouchableOpacity>

        {/* Bottom link */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/sign-in')}
          className="mt-8 items-center"
        >
          <Text className="text-muted-500 font-inter text-xs text-center">
            Вже маєте акаунт?{'  '}
            <Text className="text-bronze">Увійти</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
