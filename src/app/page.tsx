'use client';

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRelationships } from '@/hooks/useRelationships';
import RelationshipChart from '@/components/RelationshipChart';

interface MessageStats {
  manitto: { sent: number; received: number };
  target: { sent: number; received: number };
}

interface DailyCount {
  date: string;
  manitto: { sent: number; received: number };
  target: { sent: number; received: number };
}

export default function DashboardPage() {
  const { data, isLoading } = useRelationships();
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyCount[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/messages/stats');
        if (res.ok) {
          const json = await res.json();
          setStats(json);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    const fetchDailyStats = async () => {
      try {
        const res = await fetch('/api/messages/daily-stats');
        if (res.ok) {
          const json = await res.json();
          setDailyStats(json);
        }
      } catch (error) {
        console.error('Failed to fetch daily stats:', error);
      }
    };

    fetchStats();
    fetchDailyStats();
  }, []);



  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load data</div>;

  const manittoChartData = dailyStats.map(item => ({
    date: item.date,
    sent: item.manitto.sent,
    received: item.manitto.received
  }));

  const targetChartData = dailyStats.map(item => ({
    date: item.date,
    sent: item.target.sent,
    received: item.target.received
  }));

  return (
    <div className="h-full bg-white overflow-y-auto">
      <header className="px-4 py-3 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">홈</h1>
      </header>
      <main className="p-4 space-y-3">
        {/* 비밀친구와의 대화 통계 */}
        {data.manittoId && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                비밀친구 (My Manitto)
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-indigo-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-indigo-900">보냄</span>
                    <ArrowUpRight className="text-indigo-600" size={14} />
                  </div>
                  <p className="text-xl font-bold text-indigo-600">
                    {stats?.manitto.sent || 0}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-indigo-900">받음</span>
                    <ArrowDownLeft className="text-indigo-600" size={14} />
                  </div>
                  <p className="text-xl font-bold text-indigo-600">
                    {stats?.manitto.received || 0}
                  </p>
                </div>
                <div className="bg-indigo-100 rounded-lg p-2">
                  <span className="text-xs font-medium text-indigo-900">총계</span>
                  <p className="text-xl font-bold text-indigo-600">
                    {(stats?.manitto.sent || 0) + (stats?.manitto.received || 0)}
                  </p>
                </div>
              </div>
            </div>
            {dailyStats.length > 0 && (
              <RelationshipChart
                data={manittoChartData}
                title="비밀친구와의 대화"
                color="indigo"
              />
            )}
          </>
        )}

        {/* 내 마니또 대상과의 대화 통계 */}
        {data.target && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                내 마니또 대상 ({data.target.name})
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-green-900">보냄</span>
                    <ArrowUpRight className="text-green-600" size={14} />
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {stats?.target.sent || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-green-900">받음</span>
                    <ArrowDownLeft className="text-green-600" size={14} />
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {stats?.target.received || 0}
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <span className="text-xs font-medium text-green-900">총계</span>
                  <p className="text-xl font-bold text-green-600">
                    {(stats?.target.sent || 0) + (stats?.target.received || 0)}
                  </p>
                </div>
              </div>
            </div>
            {dailyStats.length > 0 && (
              <RelationshipChart
                data={targetChartData}
                title="내 마니또 대상과의 대화"
                color="green"
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
