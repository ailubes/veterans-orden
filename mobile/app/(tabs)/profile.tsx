import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react-native';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAlert } from '@/components/ui/app-alert';

interface MenuItemProps {
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  onPress: () => void;
  color?: string;
  showArrow?: boolean;
}

function MenuItem({ label, icon: Icon, onPress, color = '#b5793a', showArrow = true }: MenuItemProps) {
  return (
    <TouchableOpacity activeOpacity={1}
      onPress={onPress}
      className="bg-panel-900 border border-panel-850 rounded-lg p-4 flex-row items-center justify-between"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${color}20` }}>
          <Icon color={color} size={20} />
        </View>
        <Text className="text-text-100 font-inter text-sm">{label}</Text>
      </View>
      {showArrow && <ChevronRight color="#8b8f96" size={20} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { data: profile, isLoading } = useQuery({ queryKey: ['me'], queryFn: api.me.get });
  const { showAlert } = useAlert();

  function handleSignOut() {
    showAlert({
      title: 'Вихід',
      message: 'Ви впевнені, що хочете вийти?',
      buttons: [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ],
    });
  }

  const firstName = profile?.first_name || '';
  const lastName = profile?.last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

  return (
    <ScrollView className="flex-1 bg-bg-950" contentContainerClassName="p-4 pb-8">
      {/* Profile Header */}
      <View className="bg-panel-900 border border-panel-850 rounded-xl p-6 mb-4 items-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(181,121,58,0.2)', borderWidth: 2, borderColor: 'rgba(181,121,58,0.3)' }}>
          <Text className="text-bronze text-3xl font-inter-black">{initials}</Text>
        </View>
        <Text className="text-text-100 font-inter-black text-xl mb-1">
          {firstName} {lastName}
        </Text>
        <Text className="text-muted-500 text-sm font-inter">{profile?.email}</Text>

        {/* Quick Stats Row */}
        <View className="flex-row mt-4 pt-4 border-t border-panel-850 w-full">
          <View className="flex-1 items-center">
            <Text className="text-text-100 font-inter-black text-xl">{profile?.points || 0}</Text>
            <Text className="text-muted-500 text-xs font-inter">Балів</Text>
          </View>
          <View className="w-px bg-panel-850" />
          <View className="flex-1 items-center">
            <Text className="text-text-100 font-inter-black text-xl">{profile?.level || 1}</Text>
            <Text className="text-muted-500 text-xs font-inter">Рівень</Text>
          </View>
          <View className="w-px bg-panel-850" />
          <View className="flex-1 items-center">
            <Text className="text-text-100 font-inter-black text-xl">{profile?.referral_count || 0}</Text>
            <Text className="text-muted-500 text-xs font-inter">Запрошено</Text>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View className="mt-4 mb-2">
        <Text className="text-text-200 font-inter-bold text-sm mb-3">Налаштування</Text>
        <View className="space-y-2">
          <MenuItem
            label="Повідомлення"
            icon={Bell}
            onPress={() => router.push('/notifications')}
            color="#b5793a"
          />
          <MenuItem
            label="Редагувати профіль"
            icon={User}
            onPress={() => router.push('/profile-edit')}
            color="#6b7280"
          />
          <MenuItem
            label="Налаштування"
            icon={Settings}
            onPress={() => router.push('/settings')}
            color="#6b7280"
          />
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity activeOpacity={1}
        onPress={handleSignOut}
        className="mt-6 bg-panel-900 rounded-lg p-4 flex-row items-center justify-center"
        style={{ borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}
      >
        <LogOut color="#ef4444" size={20} />
        <Text className="text-red-400 font-inter-bold text-sm ml-2">Вийти з акаунту</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View className="mt-8 items-center">
        <Text className="text-muted-500 text-xs font-inter">Орден Ветеранів</Text>
        <Text className="text-muted-500 text-[10px] font-inter mt-1">v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
