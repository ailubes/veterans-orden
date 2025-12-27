interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function StatsCard({ label, value, change, changeType = 'neutral' }: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-timber-beam',
  };

  return (
    <div className="bg-canvas border-2 border-timber-dark p-6 relative">
      <div className="joint" style={{ top: '-3px', left: '-3px' }} />
      <div className="joint" style={{ top: '-3px', right: '-3px' }} />

      <p className="label mb-2">{label}</p>
      <p className="font-syne text-4xl font-bold">{value}</p>
      {change && (
        <p className={`text-xs mt-2 ${changeColors[changeType]}`}>{change}</p>
      )}
    </div>
  );
}
