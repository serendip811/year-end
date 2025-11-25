'use client';

import Link from 'next/link';
import { MessageCircle, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import DailyMessageChart from '@/components/DailyMessageChart';
import { useRelationships } from '@/hooks/useRelationships';

interface MessageStats {
  manitto: { sent: number; received: number };
  target: { sent: number; received: number };
}

interface DailyCount {
  date: string;
  manitto: number;
  target: number;
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


  const getRoomId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('_');
  };



  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load data</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">카모빌링 마니또 채팅</h1>

        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Chat with Manitto (Anonymous) */}
            {data.manittoId ? (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <Link href={`/chat/${getRoomId(data.user.id, data.manittoId)}`} className="block">
                  <div className="hover:shadow-md transition-shadow cursor-pointer p-6 flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <User className="text-indigo-600" size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">비밀친구 (My Manitto)</h3>
                      <p className="text-sm text-gray-500">나를 챙겨주는 비밀친구와의 대화</p>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg text-gray-500">
                아직 마니또가 배정되지 않았습니다.
              </div>
            )}


            {/* Chat with Target (Real Name) */}
            {data.target ? (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <Link href={`/chat/${getRoomId(data.user.id, data.target.id)}`} className="block">
                  <div className="hover:shadow-md transition-shadow cursor-pointer p-6 flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <MessageCircle className="text-green-600" size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">내 마니또 대상 ({data.target.name})</h3>
                      <p className="text-sm text-gray-500">내가 챙겨야 할 사람과의 대화</p>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg text-gray-500">
                아직 대상이 배정되지 않았습니다.
              </div>
            )}

          </div>

          {/* Daily Message Chart */}
          {dailyStats.length > 0 && (
            <div className="mt-6">
              <DailyMessageChart data={dailyStats} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
