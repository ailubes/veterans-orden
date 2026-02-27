import { View, Text, TouchableOpacity, Share, Linking, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { CreditCard, Users } from 'lucide-react-native';
import { api } from '@/lib/api';

const APP_URL = process.env.EXPO_PUBLIC_APP_URL!;

interface NextStepConfig {
  icon: React.ComponentType<{ color: string; size: number }>;
  title: string;
  description: string;
  cta: string;
  action: 'payment' | 'share' | 'none';
}

const NEXT_STEPS: Record<string, NextStepConfig> = {
  supporter: {
    icon: CreditCard,
    title: 'Зробіть перший членський внесок',
    description: 'Оформіть членство від 49 грн, щоб перейти на рівень «Кандидат в члени» та отримати право голосу.',
    cta: 'Оформити членство',
    action: 'payment',
  },
  candidate: {
    icon: Users,
    title: 'Запросіть 2 кандидатів',
    description: 'Запросіть щонайменше 2 друзів, які зареєструються та оформлять членство — і ви станете «Членом Ордену».',
    cta: 'Запросити друзів',
    action: 'share',
  },
  member: {
    icon: Users,
    title: 'Допоможіть 2 кандидатам стати Членами',
    description: 'Продовжуйте розширювати мережу Ордену, залучаючи нових членів через ваше реферальне посилання.',
    cta: 'Поділитись посиланням',
    action: 'share',
  },
  honorary_member: {
    icon: Users,
    title: 'Розширюйте мережу Ордену',
    description: 'Залучайте нових членів через реферальне посилання — це ключ до подальшого зростання.',
    cta: 'Поділитись посиланням',
    action: 'share',
  },
  senior_member: {
    icon: Users,
    title: 'Продовжуйте залучати членів',
    description: 'Ваш особистий внесок у зростання Ордену відкриє вам нові рівні.',
    cta: 'Поділитись посиланням',
    action: 'share',
  },
  council_member: {
    icon: Users,
    title: 'Зміцнюйте мережу Ордену',
    description: 'Залучайте нових членів та допомагайте їм зростати всередині Ордену.',
    cta: 'Поділитись посиланням',
    action: 'share',
  },
};

interface NextStepCardProps {
  role: string;
  referralCode?: string;
}

export function NextStepCard({ role, referralCode }: NextStepCardProps) {
  const [loading, setLoading] = useState(false);
  const step = NEXT_STEPS[role];

  if (!step) return null;

  const referralLink = referralCode
    ? `${APP_URL}/join?ref=${referralCode}`
    : APP_URL;

  async function handlePress() {
    if (step.action === 'payment') {
      setLoading(true);
      try {
        const result = await api.payments.create('basic_49');
        if (result.hutkoToken && result.orderId) {
          const url = `${APP_URL}/pay?token=${result.hutkoToken}&orderId=${result.orderId}&tier=basic_49`;
          await Linking.openURL(url);
        }
      } catch (e) {
        // silently ignore
      } finally {
        setLoading(false);
      }
    } else if (step.action === 'share') {
      await Share.share({
        message: `Приєднуйся до Ордену Ветеранів! ${referralLink}`,
        url: referralLink,
      });
    }
  }

  const Icon = step.icon;

  return (
    <View
      className="rounded-xl p-4 border border-panel-850"
      style={{ borderLeftWidth: 3, borderLeftColor: '#b5793a', backgroundColor: '#141618' }}
    >
      <View className="flex-row items-start gap-x-3 mb-3">
        <View
          className="w-10 h-10 rounded-lg items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(181,121,58,0.2)' }}
        >
          <Icon color="#b5793a" size={20} />
        </View>
        <View className="flex-1">
          <Text className="text-text-100 font-inter-bold text-sm mb-1">{step.title}</Text>
          <Text className="text-muted-400 text-xs font-inter leading-relaxed">{step.description}</Text>
        </View>
      </View>

      {step.action !== 'none' && (
        <TouchableOpacity
          onPress={handlePress}
          disabled={loading}
          className="rounded-lg py-2.5 items-center"
          style={{ backgroundColor: '#b5793a' }}
          activeOpacity={1}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-inter-bold text-sm">{step.cta}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
