import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const CATEGORIES = [
  { slug: 'jobs', label: 'Зайнятість', emoji: '💼', desc: 'Вакансії та підприємництво' },
  { slug: 'legal', label: 'Правова допомога', emoji: '⚖️', desc: 'Безоплатні консультації' },
  { slug: 'support', label: 'Психологічна підтримка', emoji: '💙', desc: 'Кризові лінії та терапія' },
  { slug: 'healthcare', label: 'Охорона здоров\'я', emoji: '🏥', desc: 'Реабілітація та протезування' },
];

export default function ResourcesScreen() {
  return (
    <ScrollView className="flex-1 bg-bg-950" contentContainerClassName="p-4">
      <Text className="text-bronze font-mono text-xs tracking-widest mb-2">// РЕСУРСИ</Text>
      <Text className="text-text-100 text-2xl font-inter-black mb-3">Ресурси для ветеранів</Text>
      <Text className="text-muted-500 text-sm font-inter mb-6 leading-relaxed">
        Перевірені організації та програми для підтримки вашого переходу до цивільного життя.
      </Text>

      <View className="space-y-3">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity activeOpacity={1}
            key={cat.slug}
            onPress={() => router.push(`/resources/${cat.slug}` as any)}
            className="bg-panel-900 border border-panel-850 rounded-lg p-5 flex-row items-center gap-4"
          >
            <Text className="text-3xl">{cat.emoji}</Text>
            <View className="flex-1">
              <Text className="text-text-100 font-inter-bold text-base">{cat.label}</Text>
              <Text className="text-muted-500 text-xs font-inter mt-0.5">{cat.desc}</Text>
            </View>
            <Text className="text-bronze text-lg">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
