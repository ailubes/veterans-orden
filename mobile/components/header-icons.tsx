import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeaderIconsProps {
  showNotification?: boolean;
}

export function HeaderIcons({ showNotification = true }: HeaderIconsProps) {
  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: api.me.get,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications.list,
    refetchInterval: 30000,
  });

  const unreadCount = notificationsData?.unreadCount || 0;
  const firstName = meData?.first_name || '';
  const lastName = meData?.last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

  return (
    <View className="flex-row items-center gap-4 mr-4">
      {showNotification && (
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          className="relative w-10 h-10 items-center justify-center"
          activeOpacity={1}
        >
          <Bell color="#e7e7e7" size={24} />
          {unreadCount > 0 && (
            <View className="absolute -top-0.5 -right-0.5 bg-red-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1">
              <Text className="text-white text-[10px] font-inter-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => router.push('/profile')}
        className="w-10 h-10 rounded-full bg-bronze/20 items-center justify-center border border-bronze/30"
        activeOpacity={1}
      >
        <Text className="text-bronze font-inter-bold text-sm">{initials}</Text>
      </TouchableOpacity>
    </View>
  );
}
