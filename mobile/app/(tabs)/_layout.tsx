import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Home, Vote, Calendar, LayoutGrid } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

// expo-notifications is not supported in Expo Go - use conditional import
const isExpoGo = Constants.appOwnership === 'expo';

export default function TabsLayout() {
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications.list,
    refetchInterval: 30000,
  });

  const unreadCount = notificationsData?.unreadCount || 0;

  useEffect(() => {
    if (isExpoGo) return; // Skip in Expo Go

    const Notifications = require('expo-notifications');
    Notifications.setBadgeCountAsync(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/(auth)');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/(auth)');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#141618',
          borderTopColor: 'rgba(255,255,255,0.10)',
        },
        tabBarActiveTintColor: '#b5793a',
        tabBarInactiveTintColor: '#8b8f96',
        headerStyle: { backgroundColor: '#141618' },
        headerTintColor: '#e7e7e7',
        headerTitleStyle: { fontFamily: 'Inter_700Bold' },
        // Hide the default header since we use TopAppBar in the dashboard
        headerShown: false,
      }}
    >
      {/* Visible tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Головна',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Активність',
          tabBarIcon: ({ color, size }) => <Vote color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Події',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Меню',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />

      {/* Hidden tabs — reachable from Menu grid; native header for back navigation */}
      <Tabs.Screen
        name="feed"
        options={{
          href: null,
          headerShown: true,
          title: 'Стрічка',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: true,
          title: 'Профіль',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          href: null,
          headerShown: true,
          title: 'Спільнота',
        }}
      />
    </Tabs>
  );
}
