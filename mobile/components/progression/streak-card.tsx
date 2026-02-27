import { View, Text } from 'react-native';
import { ProgressBar } from '@/components/progress-bar';

interface StreakCardProps {
  streak: {
    current: number;
    longest: number;
    totalDays: number;
    nextMilestone: number;
    daysUntilMilestone: number;
  };
}

function getEncouragement(current: number): string {
  if (current === 0) return 'Почніть серію вже сьогодні!';
  if (current < 7) return 'Гарний початок! Продовжуйте в тому ж дусі.';
  if (current < 30) return 'Чудова серія! Ви на вірному шляху.';
  if (current < 100) return 'Вражаюча відданість! Так тримати.';
  return 'Легендарна серія! Ви справжній ветеран.';
}

export function StreakCard({ streak }: StreakCardProps) {
  const milestoneProgress = streak.nextMilestone > 0
    ? ((streak.current / streak.nextMilestone) * 100)
    : 100;

  return (
    <View
      className="rounded-xl p-4 border border-panel-850"
      style={{ backgroundColor: '#141618' }}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-x-2">
          <Text className="text-2xl">🔥</Text>
          <View>
            <Text className="text-text-100 font-inter-bold text-base">Активність</Text>
            <Text className="text-muted-400 text-xs font-inter">Ваша серія</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-bronze font-inter-black text-3xl">{streak.current}</Text>
          <Text className="text-muted-400 text-xs font-inter">
            {streak.current === 1 ? 'день' : streak.current < 5 ? 'дні' : 'днів'}
          </Text>
        </View>
      </View>

      {/* Progress to next milestone */}
      {streak.nextMilestone > 0 && (
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-muted-400 text-xs font-inter">
              До {streak.nextMilestone} днів
            </Text>
            <Text className="text-bronze text-xs font-inter">
              ще {streak.daysUntilMilestone}{' '}
              {streak.daysUntilMilestone === 1 ? 'день' : streak.daysUntilMilestone < 5 ? 'дні' : 'днів'}
            </Text>
          </View>
          <ProgressBar progress={milestoneProgress} height={6} />
        </View>
      )}

      {/* Encouragement */}
      <Text className="text-text-200 text-xs font-inter mb-3">
        {getEncouragement(streak.current)}
      </Text>

      {/* Stats row */}
      <View className="flex-row border-t border-panel-850 pt-3 gap-x-4">
        <View className="flex-1 items-center">
          <Text className="text-text-100 font-inter-bold text-lg">{streak.longest}</Text>
          <Text className="text-muted-400 text-xs font-inter">Рекорд</Text>
        </View>
        <View className="w-px bg-panel-850" />
        <View className="flex-1 items-center">
          <Text className="text-text-100 font-inter-bold text-lg">{streak.totalDays}</Text>
          <Text className="text-muted-400 text-xs font-inter">Всього днів</Text>
        </View>
      </View>
    </View>
  );
}
