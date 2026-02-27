import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProgressBar } from '@/components/progress-bar';
import { StreakCard } from '@/components/progression/streak-card';
import { RoleJourney } from '@/components/progression/role-journey';
import { NextStepCard } from '@/components/progression/next-step-card';

const APP_URL = process.env.EXPO_PUBLIC_APP_URL!;

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProgressionScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['progression'],
    queryFn: api.progression.get,
    staleTime: 60_000,
  });

  const progression = data?.data;

  // Fire-and-forget celebrate milestones on mount
  useEffect(() => {
    if (!progression?.milestones?.length) return;
    progression.milestones.forEach((m: any) => {
      api.progression.celebrateMilestone(m.id).catch(() => {});
    });
  }, [progression?.milestones]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg-950 items-center justify-center">
        <ActivityIndicator color="#b5793a" size="large" />
      </View>
    );
  }

  if (!progression) {
    return (
      <View className="flex-1 bg-bg-950 items-center justify-center p-8">
        <Text className="text-muted-400 text-center font-inter">
          Не вдалося завантажити дані прогресії.
        </Text>
        <TouchableOpacity onPress={() => refetch()} className="mt-4" activeOpacity={1}>
          <Text className="text-bronze font-inter-bold">Спробувати знову</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { currentRole, roleJourney, incompleteTasks, achievements, streak, progress } = progression;
  const progressPercent = progress?.progressPercent ?? 0;

  return (
    <ScrollView
      className="flex-1 bg-bg-950"
      contentContainerClassName="p-4 pb-10"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor="#b5793a"
        />
      }
    >
      {/* Header */}
      <Text className="text-muted-400 text-xs font-inter uppercase tracking-wider mb-1">
        МІЙ ПРОГРЕС
      </Text>
      <Text className="text-text-100 text-2xl font-inter-black mb-6">
        Ваш шлях в Ордені
      </Text>

      {/* Role Badge Card */}
      <View
        className="rounded-xl p-5 mb-4 border border-panel-850"
        style={{ backgroundColor: '#141618' }}
      >
        <View className="flex-row items-center gap-x-3 mb-4">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center"
            style={{ backgroundColor: 'rgba(181,121,58,0.2)' }}
          >
            <Text style={{ fontSize: 32 }}>{currentRole.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-muted-400 text-xs font-inter mb-0.5">Поточний рівень</Text>
            <Text className="font-inter-black text-xl" style={{ color: '#b5793a' }}>
              {currentRole.displayName}
            </Text>
            <Text className="text-muted-400 text-xs font-inter">
              Рівень {currentRole.level}
            </Text>
          </View>
        </View>

        {progress?.nextRole ? (
          <>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-muted-400 text-xs font-inter">
                До рівня «{progress.nextRoleLabel}»
              </Text>
              <Text className="text-bronze text-xs font-inter-bold">
                {progressPercent}%
              </Text>
            </View>
            <ProgressBar progress={progressPercent} height={8} />
          </>
        ) : (
          <View
            className="rounded-lg px-3 py-2 items-center"
            style={{ backgroundColor: 'rgba(181,121,58,0.1)' }}
          >
            <Text className="text-bronze font-inter-bold text-sm">
              🏆 Найвищий рівень досягнуто!
            </Text>
          </View>
        )}
      </View>

      {/* Next Step Card */}
      <View className="mb-4">
        <NextStepCard
          role={currentRole.role}
          referralCode={progression.referralCode}
        />
      </View>

      {/* Streak Card */}
      {streak && (
        <View className="mb-4">
          <StreakCard streak={streak} />
        </View>
      )}

      {/* Incomplete Tasks */}
      {incompleteTasks && incompleteTasks.length > 0 && (
        <View className="mb-4">
          <Text className="text-text-100 font-inter-bold text-base mb-3">
            Активні завдання
          </Text>
          {incompleteTasks.map((task: any) => (
            <View
              key={task.id}
              className="rounded-xl p-4 mb-2 border border-panel-850"
              style={{ backgroundColor: '#141618' }}
            >
              <Text className="text-text-100 font-inter-bold text-sm mb-1">
                {task.title}
              </Text>
              {task.description && (
                <Text className="text-muted-400 text-xs font-inter mb-2" numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              {task.progress !== undefined && (
                <View className="mb-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-muted-400 text-xs font-inter">Прогрес</Text>
                    <Text className="text-bronze text-xs font-inter">
                      {task.progress}/{task.target}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={task.target ? (task.progress / task.target) * 100 : 0}
                    height={4}
                  />
                </View>
              )}
              {task.ctaUrl && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`${APP_URL}${task.ctaUrl}`)}
                  className="rounded-lg py-2 items-center"
                  style={{ backgroundColor: 'rgba(181,121,58,0.2)' }}
                  activeOpacity={1}
                >
                  <Text className="text-bronze font-inter-bold text-sm">
                    {task.ctaLabel || 'Виконати'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Role Journey */}
      {roleJourney && roleJourney.length > 0 && (
        <View className="mb-4">
          <Text className="text-text-100 font-inter-bold text-base mb-4">
            Шлях Ордену
          </Text>
          <View
            className="rounded-xl p-4 border border-panel-850"
            style={{ backgroundColor: '#141618' }}
          >
            <RoleJourney roles={roleJourney} />
          </View>
        </View>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <View className="mb-4">
          <Text className="text-text-100 font-inter-bold text-base mb-3">
            Досягнення
          </Text>
          {achievements.map((achievement: any) => (
            <View
              key={achievement.id}
              className="flex-row items-center rounded-xl p-4 mb-2 border border-panel-850"
              style={{ backgroundColor: '#141618' }}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-3 flex-shrink-0"
                style={{ backgroundColor: 'rgba(181,121,58,0.15)' }}
              >
                <Text style={{ fontSize: 24 }}>{achievement.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-100 font-inter-bold text-sm">{achievement.title}</Text>
                {achievement.description && (
                  <Text className="text-muted-400 text-xs font-inter" numberOfLines={1}>
                    {achievement.description}
                  </Text>
                )}
              </View>
              <Text className="text-muted-500 text-[10px] font-inter ml-2">
                {formatDate(achievement.earnedAt)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
