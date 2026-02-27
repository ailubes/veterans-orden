import '../global.css';
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import { IBMPlexMono_400Regular, IBMPlexMono_600SemiBold, IBMPlexMono_700Bold } from '@expo-google-fonts/ibm-plex-mono';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { AlertProvider } from '@/components/ui/app-alert';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

// expo-notifications is not supported in Expo Go since SDK 53 — only use in dev/prod builds
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

async function registerForPushNotifications() {
  if (isExpoGo || !Device.isDevice) return;

  const Notifications = require('expo-notifications');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const { data: token } = await Notifications.getExpoPushTokenAsync();
  if (token) {
    await api.pushToken.register(token).catch(console.error);
  }
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_900Black,
    IBMPlexMono_400Regular,
    IBMPlexMono_600SemiBold,
    IBMPlexMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        registerForPushNotifications();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle notification taps
  useEffect(() => {
    if (isExpoGo) return;

    const Notifications = require('expo-notifications');

    const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        router.push(data.screen as any);
      }
    });

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
    <AlertProvider>
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor="#0f1011" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#141618' },
          headerTintColor: '#e7e7e7',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0f1011' },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ title: 'Сповіщення' }} />
        <Stack.Screen name="resources/index" options={{ title: 'Ресурси' }} />
        <Stack.Screen name="resources/[category]" options={{ title: 'Ресурси' }} />
        <Stack.Screen name="challenges" options={{ title: 'Виклики' }} />
        <Stack.Screen name="leaderboard" options={{ title: 'Рейтинг' }} />
        <Stack.Screen name="points" options={{ title: 'Мої бали' }} />
        <Stack.Screen name="profile-edit" options={{ title: 'Редагувати профіль' }} />
        <Stack.Screen name="settings" options={{ title: 'Налаштування' }} />
        <Stack.Screen name="messages/index" options={{ headerShown: false }} />
        <Stack.Screen name="messages/[conversationId]" options={{ title: 'Чат' }} />
        <Stack.Screen name="messages/dm/[userId]" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="progression" options={{ title: 'Мій прогрес' }} />
      </Stack>
    </QueryClientProvider>
    </AlertProvider>
    </SafeAreaProvider>
  );
}
