'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EngagementData {
  date: string;
  label: string;
  events: number;
  votes: number;
  tasks: number;
}

export function EngagementChart() {
  const [data, setData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/engagement');
      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-timber-dark/10 w-48" />
          <div className="h-64 bg-timber-dark/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <h3 className="font-syne text-xl font-bold mb-6">Активність (7 днів)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Bar dataKey="events" name="Події" fill="#D4A574" />
          <Bar dataKey="votes" name="Голосування" fill="#1A1A1A" />
          <Bar dataKey="tasks" name="Завдання" fill="#8B7355" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
