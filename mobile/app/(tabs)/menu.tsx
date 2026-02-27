import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import {
  BookOpen,
  Target,
  BarChart3,
  Trophy,
  User,
  Users,
  FileText,
  Settings,
  MessageCircle,
} from 'lucide-react-native';
import { TopAppBar } from '@/components/top-app-bar';

const { width: screenWidth } = Dimensions.get('window');

interface MenuItemProps {
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  onPress: () => void;
  color: string;
}

function MenuItem({ label, icon: Icon, onPress, color }: MenuItemProps) {
  return (
    <TouchableOpacity activeOpacity={1}
      onPress={onPress}
      className="bg-panel-900 border border-panel-850 rounded-xl p-4 items-center justify-center active:opacity-70"
      style={{ width: (screenWidth - 48) / 2, height: 120 }}
    >
      <View
        className="w-14 h-14 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon color={color} size={28} />
      </View>
      <Text className="text-text-100 font-inter-bold text-sm text-center">{label}</Text>
    </TouchableOpacity>
  );
}

export default function MenuScreen() {
  const menuItems: MenuItemProps[] = [
    {
      label: 'Спільнота',
      icon: Users,
      onPress: () => router.push('/(tabs)/community'),
      color: '#06b6d4',
    },
    {
      label: 'Стрічка',
      icon: FileText,
      onPress: () => router.push('/(tabs)/feed'),
      color: '#f97316',
    },
    {
      label: 'Повідомлення',
      icon: MessageCircle,
      onPress: () => router.push('/messages'),
      color: '#ec4899',
    },
    {
      label: 'Ресурси',
      icon: BookOpen,
      onPress: () => router.push('/resources'),
      color: '#3b82f6',
    },
    {
      label: 'Виклики',
      icon: Target,
      onPress: () => router.push('/challenges'),
      color: '#22c55e',
    },
    {
      label: 'Рейтинг',
      icon: BarChart3,
      onPress: () => router.push('/leaderboard'),
      color: '#a855f7',
    },
    {
      label: 'Прогресія',
      icon: Trophy,
      onPress: () => router.push('/progression'),
      color: '#b5793a',
    },
    {
      label: 'Бали',
      icon: Trophy,
      onPress: () => router.push('/points'),
      color: '#f59e0b',
    },
    {
      label: 'Профіль',
      icon: User,
      onPress: () => router.push('/profile'),
      color: '#b5793a',
    },
    {
      label: 'Налаштування',
      icon: Settings,
      onPress: () => router.push('/profile'),
      color: '#6b7280',
    },
  ];

  return (
    <View className="flex-1 bg-bg-950">
      <TopAppBar title="Меню" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-8"
      >
        <Text className="text-text-100 text-2xl font-inter-black mb-6">Всі функції</Text>

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {menuItems.map((item) => (
          <MenuItem key={item.label} {...item} />
        ))}
      </View>

        {/* App Info */}
        <View className="mt-8 items-center">
          <Text className="text-muted-500 text-xs font-inter">Орден Ветеранів</Text>
          <Text className="text-muted-500 text-[10px] font-inter mt-1">v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
