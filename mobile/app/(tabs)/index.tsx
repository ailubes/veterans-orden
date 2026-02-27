import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Users,
  BookOpen,
  Target,
  BarChart3,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { TopAppBar } from '@/components/top-app-bar';
import { CompactInviteBanner } from '@/components/compact-invite-banner';
import { ProgressBar } from '@/components/progress-bar';

const { width: screenWidth } = Dimensions.get('window');

// Calculate progress to next level (gamification logic)
function calculateLevelProgress(points: number, level: number): number {
  // Simple progression: each level requires level * 500 points
  const pointsForCurrentLevel = (level - 1) * 500;
  const pointsForNextLevel = level * 500;
  const pointsInCurrentLevel = points - pointsForCurrentLevel;
  const pointsNeededForNextLevel = pointsForNextLevel - pointsForCurrentLevel;
  const progress = (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;
  return Math.min(100, Math.max(0, progress));
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  showProgress,
  progress,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <View className="flex-1 bg-panel-900 border border-panel-850 rounded-xl p-4 mx-1">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-muted-400 text-xs font-inter tracking-wider uppercase">{label}</Text>
        <Icon color="#b5793a" size={18} />
      </View>
      <Text className="text-text-100 text-3xl font-inter-black">{value}</Text>
      {sub && (
        <View className="mt-2">
          <Text className="text-bronze text-xs font-inter">{sub}</Text>
          {/* Progress bar to next level */}
          {showProgress && progress !== undefined && (
            <View className="mt-1.5">
              <ProgressBar progress={progress} height={4} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function ActionButton({
  label,
  sub,
  icon: Icon,
  onPress,
  color = '#b5793a',
}: {
  label: string;
  sub: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-panel-900 border border-panel-850 rounded-xl p-3 flex-row items-center"
      style={{ width: (screenWidth - 48) / 2 }}
      activeOpacity={1}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon color={color} size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-text-100 font-inter-bold text-sm" numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-muted-400 text-xs font-inter" numberOfLines={1}>
          {sub}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const [userName, setUserName] = useState('');

  const { data: meData, isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: api.me.get,
    retry: 1,
  });

  const { data: progressionData } = useQuery({
    queryKey: ['progression'],
    queryFn: api.progression.get,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserName(user?.user_metadata?.first_name || 'Член');
    });
  }, []);

  const profile = meData;
  const displayName = profile?.first_name || userName;
  const currentLevel = profile?.level || 1;
  const currentPoints = profile?.points || 0;
  const levelProgress = calculateLevelProgress(currentPoints, currentLevel);

  const progression = progressionData?.data;
  const progressPercent = progression?.progress?.progressPercent ?? 0;
  const nextRoleLabel = progression?.progress?.nextRoleLabel;
  const currentRoleLabel = progression?.currentRole?.displayName;
  const currentRoleLevel = progression?.currentRole?.level;

  return (
    <View className="flex-1 bg-bg-950">
      {/* Top App Bar - Fixed at top */}
      <TopAppBar />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#b5793a" />
        }
      >
        {/* Welcome Section - Clean, no code syntax */}
        <View className="mb-6">
          <Text className="text-text-100 text-2xl font-inter-black">Вітаємо, {displayName}!</Text>
          <Text className="text-muted-400 text-sm font-inter mt-1">Готові до нових звершень?</Text>
        </View>

        {/* Stats */}
        {isLoading ? (
          <ActivityIndicator color="#b5793a" className="my-8" />
        ) : (
          <View className="flex-row mb-2">
            <StatCard
              label="Мої бали"
              value={currentPoints}
              sub={`Рівень ${currentLevel}`}
              icon={Trophy}
              showProgress
              progress={levelProgress}
            />
            <StatCard
              label="Запрошено"
              value={profile?.referral_count || 0}
              sub="членів Ордену"
              icon={Users}
            />
          </View>
        )}

        {/* Progression Teaser Card */}
        {progression && (
          <TouchableOpacity
            onPress={() => router.push('/progression')}
            className="mt-4 rounded-xl p-4 border border-panel-850"
            style={{ backgroundColor: '#141618' }}
            activeOpacity={1}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-text-100 font-inter-bold text-sm">
                  {currentRoleLabel || 'Мій рівень'}
                </Text>
                <Text className="text-muted-400 text-xs font-inter">
                  Рівень {currentRoleLevel}
                </Text>
              </View>
              {progression?.progress?.nextRole ? (
                <Text className="text-muted-400 text-xs font-inter">
                  до «{nextRoleLabel}»
                </Text>
              ) : (
                <Text className="text-xs font-inter" style={{ color: '#b5793a' }}>🏆 Макс. рівень</Text>
              )}
            </View>

            {progression?.progress?.nextRole ? (
              <>
                <ProgressBar progress={progressPercent} height={6} />
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-muted-400 text-xs font-inter">
                    {progressPercent}% до наступного рівня
                  </Text>
                  <Text className="text-xs font-inter-bold" style={{ color: '#b5793a' }}>
                    Переглянути ›
                  </Text>
                </View>
              </>
            ) : (
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-muted-400 text-xs font-inter">
                  Ви досягли найвищого рівня!
                </Text>
                <Text className="text-xs font-inter-bold" style={{ color: '#b5793a' }}>
                  Переглянути ›
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Quick Actions - Moved UP (immediately visible) */}
        <View className="mt-6">
          <Text className="text-text-100 font-inter-bold text-base mb-3">Швидкий доступ</Text>

          <View className="flex-row flex-wrap justify-between">
            <ActionButton
              label="Ресурси"
              sub="Робота та право"
              icon={BookOpen}
              onPress={() => router.push('/resources')}
              color="#3b82f6"
            />
            <ActionButton
              label="Виклики"
              sub="Змагайтесь за бали"
              icon={Target}
              onPress={() => router.push('/challenges')}
              color="#22c55e"
            />
          </View>

          <View className="flex-row flex-wrap justify-between mt-3">
            <ActionButton
              label="Рейтинг"
              sub="Ваше місце"
              icon={BarChart3}
              onPress={() => router.push('/leaderboard')}
              color="#a855f7"
            />
            <ActionButton
              label="Бали"
              sub="Перегляд балів"
              icon={Trophy}
              onPress={() => router.push('/points')}
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Invite Banner - Condensed, compact */}
        <View className="mt-6">
          <CompactInviteBanner referralCode={profile?.referral_code} />
        </View>

        {/* Recent Activity - Clean section header */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-100 font-inter-bold text-base">Остання активність</Text>
            <TouchableOpacity onPress={() => router.push('/activity')}>
              <Text className="text-bronze text-xs font-inter">Вся активність ›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/activity')}
            className="bg-panel-900 border border-panel-850 rounded-xl p-4 flex-row items-center justify-between"
            activeOpacity={1}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-lg bg-bronze/20 items-center justify-center mr-3">
                <CheckCircle color="#b5793a" size={20} />
              </View>
              <View>
                <Text className="text-text-100 font-inter-bold text-sm">Завдання та голосування</Text>
                <Text className="text-muted-400 text-xs font-inter">Перегляньте свою активність</Text>
              </View>
            </View>
            <ChevronRight color="#8b8f96" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
