interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function StatsCard({ label, value, change, changeType = 'neutral' }: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-muted-500',
  };

  return (
    <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
      <p className="mono text-bronze text-xs tracking-widest mb-2">{label}</p>
      <p className="font-syne text-4xl font-bold text-text-100">{value}</p>
      {change && (
        <p className={`text-xs mt-2 ${changeColors[changeType]}`}>{change}</p>
      )}
    </div>
  );
}
