import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-bg-950 px-6 justify-between py-16">
      {/* Top — Branding */}
      <View className="items-center mt-8">
        <Image
          source={require('@/assets/images/logo.png')}
          className="w-32 h-32 mb-4"
          resizeMode="contain"
        />
        <Text className="text-bronze font-mono text-xs tracking-widest mb-6">
          // ОРДЕН ВЕТЕРАНІВ
        </Text>
        <Text className="text-text-100 font-inter-black text-4xl text-center leading-tight uppercase">
          ОРДЕН{'\n'}ВЕТЕРАНІВ
        </Text>
        <Text className="text-text-200 font-inter text-sm text-center mt-4 leading-relaxed max-w-xs">
          Спільнота ветеранів, яка об'єднує, підтримує та впливає на зміни в Україні.
        </Text>
      </View>

      {/* Middle — Decorative rebar line */}
      <View className="items-center">
        <View className="w-px h-24 bg-steel opacity-30" />
        <View className="w-2 h-2 bg-bronze rounded-full mt-1" />
      </View>

      {/* Bottom — CTAs */}
      <View className="space-y-3">
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-up')}
          className="bg-bronze rounded-lg py-4 items-center"
          activeOpacity={1}
        >
          <Text className="text-bg-950 font-inter-bold text-sm tracking-wider uppercase">
            Зареєструватись
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          className="border border-panel-850 rounded-lg py-4 items-center"
          activeOpacity={1}
        >
          <Text className="text-text-100 font-inter-bold text-sm tracking-wider uppercase">
            Увійти
          </Text>
        </TouchableOpacity>

        <Text className="text-muted-500 font-inter text-xs text-center mt-2">
          Реєстрація для ветеранів, військовослужбовців, волонтерів, благодійників та активних громадян.
        </Text>
      </View>
    </View>
  );
}
