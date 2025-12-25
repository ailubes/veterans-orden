'use client';

import { useEffect, useState } from 'react';
import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GrowthData {
  date: string;
  label: string;
  new_members: number;
  total_members: number;
}

export function GrowthChart() {
  const [data, setData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/growth');
      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-timber-dark/10 w-48" />
          <div className="h-64 bg-timber-dark/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas border-2 border-timber-dark p-6 relative">
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

      <h3 className="font-syne text-xl font-bold mb-6">Зростання Членів (30 днів)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4A574" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#D4A574" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" opacity={0.1} />
          <XAxis
            dataKey="label"
            stroke="#1A1A1A"
            style={{ fontSize: '12px', fontFamily: "'Space Mono', monospace" }}
          />
          <YAxis
            stroke="#1A1A1A"
            style={{ fontSize: '12px', fontFamily: "'Space Mono', monospace" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#F5F0E8',
              border: '2px solid #1A1A1A',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px'
            }}
          />
          <Area
            type="monotone"
            dataKey="total_members"
            name="Всього членів"
            stroke="#D4A574"
            strokeWidth={2}
            fill="url(#colorTotal)"
          />
          <Line
            type="monotone"
            dataKey="new_members"
            name="Нових за день"
            stroke="#1A1A1A"
            strokeWidth={2}
            dot={{ fill: '#1A1A1A', r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
