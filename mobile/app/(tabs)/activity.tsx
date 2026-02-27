import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TopAppBar } from '@/components/top-app-bar';

type ActivityTab = 'tasks' | 'votes';

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState<ActivityTab>('votes');
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [report, setReport] = useState('');

  // Tasks query
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: api.tasks.list,
  });

  // Votes query
  const { data: votesData, isLoading: votesLoading, refetch: refetchVotes } = useQuery({
    queryKey: ['votes'],
    queryFn: api.votes.list,
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, report }: { id: string; report: string }) =>
      api.tasks.complete(id, report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedTask(null);
      setReport('');
      Alert.alert('Готово!', 'Завдання надіслано на перевірку');
    },
    onError: () => Alert.alert('Помилка', 'Не вдалося надіслати звіт'),
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, optionId }: { id: string; optionId: string }) =>
      api.votes.cast(id, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      Alert.alert('Дякуємо!', 'Ваш голос враховано');
    },
    onError: () => Alert.alert('Помилка', 'Не вдалося проголосувати'),
  });

  const tasks = tasksData?.tasks || [];
  const votes = votesData?.votes || [];

  const isLoading = activeTab === 'tasks' ? tasksLoading : votesLoading;

  const handleRefresh = () => {
    if (activeTab === 'tasks') {
      refetchTasks();
    } else {
      refetchVotes();
    }
  };

  return (
    <View className="flex-1 bg-bg-950">
      <TopAppBar title="Активність" />
      {/* Segment Control */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row bg-panel-900 rounded-xl p-1">
          <TouchableOpacity activeOpacity={1}
            onPress={() => setActiveTab('tasks')}
            className={`flex-1 py-3 rounded-lg items-center ${
              activeTab === 'tasks' ? 'bg-bronze' : ''
            }`}
          >
            <Text
              className={`font-inter-bold text-sm ${
                activeTab === 'tasks' ? 'text-bg-950' : 'text-muted-500'
              }`}
            >
              Завдання
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1}
            onPress={() => setActiveTab('votes')}
            className={`flex-1 py-3 rounded-lg items-center ${
              activeTab === 'votes' ? 'bg-bronze' : ''
            }`}
          >
            <Text
              className={`font-inter-bold text-sm ${
                activeTab === 'votes' ? 'text-bg-950' : 'text-muted-500'
              }`}
            >
              Голосування
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#b5793a" />
        }
      >
        {activeTab === 'tasks' ? (
          // Tasks Content
          <View>
            {tasks.length === 0 && !tasksLoading && (
              <Text className="text-muted-500 text-sm font-inter text-center mt-8">
                Завдань немає
              </Text>
            )}

            <View className="space-y-3">
              {tasks.map((task: any) => (
                <View key={task.id} className="bg-panel-900 border border-panel-850 rounded-lg p-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <Text className="text-text-100 font-inter-bold flex-1 mr-3">{task.title}</Text>
                    <View
                      className="px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: task.priority === 'high'
                          ? 'rgba(239,68,68,0.20)'
                          : '#1a1d20',
                      }}
                    >
                      <Text
                        className="text-xs font-mono-bold"
                        style={{ color: task.priority === 'high' ? '#f87171' : '#8b8f96' }}
                      >
                        {task.priority?.toUpperCase() || 'NORMAL'}
                      </Text>
                    </View>
                  </View>
                  {task.description && (
                    <Text
                      className="text-muted-500 text-xs font-inter leading-relaxed mb-3"
                      numberOfLines={2}
                    >
                      {task.description}
                    </Text>
                  )}
                  {task.reward_points && (
                    <Text className="text-bronze text-xs font-inter mb-3">
                      +{task.reward_points} балів
                    </Text>
                  )}
                  {task.status === 'open' && (
                    <TouchableOpacity activeOpacity={1}
                      onPress={() => setSelectedTask(task)}
                      className="bg-bronze rounded py-2.5 items-center"
                    >
                      <Text className="text-bg-950 font-inter-bold text-xs">ВИКОНАТИ ЗАВДАННЯ</Text>
                    </TouchableOpacity>
                  )}
                  {task.status === 'in_progress' && (
                    <TouchableOpacity activeOpacity={1}
                      onPress={() => setSelectedTask(task)}
                      className="border border-bronze rounded py-2.5 items-center"
                    >
                      <Text className="text-bronze font-inter-bold text-xs">НАДІСЛАТИ ЗВІТ</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : (
          // Votes Content
          <View>
            {votes.length === 0 && !votesLoading && (
              <Text className="text-muted-500 text-sm font-inter text-center mt-8">
                Активних голосувань немає
              </Text>
            )}

            <View className="space-y-4">
              {votes.map((vote: any) => (
                <View key={vote.id} className="bg-panel-900 border border-panel-850 rounded-lg p-4">
                  <Text className="text-text-100 font-inter-bold text-base mb-1">{vote.title}</Text>
                  {vote.description && (
                    <Text className="text-muted-500 text-xs font-inter mb-4 leading-relaxed">
                      {vote.description}
                    </Text>
                  )}
                  {vote.end_date && (
                    <Text className="text-muted-500 text-xs font-inter mb-4">
                      До {new Date(vote.end_date).toLocaleDateString('uk-UA')}
                    </Text>
                  )}
                  {vote.vote_options && vote.vote_options.length > 0 && (
                    <View className="space-y-2">
                      {vote.vote_options.map((option: any) => (
                        <TouchableOpacity activeOpacity={1}
                          key={option.id}
                          onPress={() => {
                            Alert.alert(
                              'Підтвердження',
                              `Проголосувати за "${option.text}"?`,
                              [
                                { text: 'Скасувати', style: 'cancel' },
                                {
                                  text: 'Голосувати',
                                  onPress: () =>
                                    voteMutation.mutate({ id: vote.id, optionId: option.id }),
                                },
                              ]
                            );
                          }}
                          className="border border-line rounded py-3 px-4"
                        >
                          <Text className="text-text-100 text-sm font-inter">{option.text}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={!!selectedTask} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-panel-900 rounded-t-2xl p-6">
            <Text className="text-text-100 font-inter-bold text-lg mb-1">{selectedTask?.title}</Text>
            <Text className="text-muted-500 text-xs font-inter mb-4">
              Опишіть як ви виконали завдання
            </Text>
            <TextInput
              className="bg-panel-850 border border-panel-850 text-text-100 px-4 py-3 rounded-lg text-sm mb-4"
              placeholder="Ваш звіт..."
              placeholderTextColor="#8b8f96"
              value={report}
              onChangeText={setReport}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity activeOpacity={1}
                onPress={() => {
                  setSelectedTask(null);
                  setReport('');
                }}
                className="flex-1 border border-line rounded-lg py-3 items-center"
              >
                <Text className="text-muted-500 font-inter-bold text-sm">Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1}
                onPress={() => completeMutation.mutate({ id: selectedTask.id, report })}
                disabled={!report.trim() || completeMutation.isPending}
                className="flex-1 bg-bronze rounded-lg py-3 items-center"
                style={{ opacity: (!report.trim() || completeMutation.isPending) ? 0.5 : 1 }}
              >
                <Text className="text-bg-950 font-inter-bold text-sm">Надіслати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
