import { View, Text } from 'react-native';

interface RoleEntry {
  role: string;
  level: number;
  displayName: string;
  icon: string;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

interface RoleJourneyProps {
  roles: RoleEntry[];
}

export function RoleJourney({ roles }: RoleJourneyProps) {
  return (
    <View>
      {roles.map((entry, index) => {
        const isLast = index === roles.length - 1;
        const isFirstFuture = entry.isFuture && (index === 0 || !roles[index - 1].isFuture);

        return (
          <View key={entry.role} className="flex-row">
            {/* Left column: circle + connecting line */}
            <View className="items-center mr-4" style={{ width: 32 }}>
              {/* Circle */}
              {entry.isCurrent ? (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center border-2"
                  style={{ borderColor: '#b5793a', backgroundColor: 'rgba(181,121,58,0.2)' }}
                >
                  <Text style={{ fontSize: 14 }}>{entry.icon}</Text>
                </View>
              ) : entry.isPast ? (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  <Text className="text-white font-inter-bold" style={{ fontSize: 12 }}>✓</Text>
                </View>
              ) : (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center border border-panel-850"
                  style={{ backgroundColor: '#1a1d21' }}
                >
                  <Text style={{ fontSize: 14, opacity: 0.4 }}>{entry.icon}</Text>
                </View>
              )}

              {/* Connecting line */}
              {!isLast && (
                <View
                  className="w-px flex-1 mt-1"
                  style={{
                    backgroundColor: entry.isPast ? '#22c55e' : '#2a2d31',
                    minHeight: 24,
                  }}
                />
              )}
            </View>

            {/* Right column: content */}
            <View
              className="flex-1 pb-4"
              style={{ opacity: entry.isFuture ? 0.5 : 1 }}
            >
              <View className="flex-row items-center gap-x-2 mb-0.5">
                <Text
                  className="font-inter-bold text-sm"
                  style={{ color: entry.isCurrent ? '#b5793a' : entry.isPast ? '#e7e7e7' : '#8b8f96' }}
                >
                  {entry.displayName}
                </Text>

                {entry.isPast && (
                  <View
                    className="px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
                  >
                    <Text className="text-green-400 text-[10px] font-inter-bold">Досягнуто</Text>
                  </View>
                )}
                {entry.isCurrent && (
                  <View
                    className="px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(181,121,58,0.2)' }}
                  >
                    <Text className="text-[10px] font-inter-bold" style={{ color: '#b5793a' }}>
                      Поточний рівень
                    </Text>
                  </View>
                )}
                {isFirstFuture && (
                  <View
                    className="px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: '#1a1d21' }}
                  >
                    <Text className="text-muted-400 text-[10px] font-inter">Наступна мета</Text>
                  </View>
                )}
              </View>

              <Text className="text-muted-400 text-xs font-inter">Рівень {entry.level}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
