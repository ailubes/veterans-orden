import { View } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  color = '#b5793a',
  height = 4,
  backgroundColor = '#1a1d21',
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      className="rounded-full overflow-hidden"
      style={{ height, backgroundColor }}
    >
      <View
        className="h-full rounded-full"
        style={{ width: `${clampedProgress}%`, backgroundColor: color }}
      />
    </View>
  );
}
