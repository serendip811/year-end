'use client';

import Link from 'next/link';
import { MessageCircle, User, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationButton from '@/components/NotificationButton';

interface UserInfo {
  id: string;
  name: string;
}

interface Relationships {
  user: UserInfo;
  target: UserInfo | null;
  manittoId: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Relationships | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/relationships');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          // If unauthorized, redirect to login
          if (res.status === 401) router.push('/login');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const getRoomId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('_');
  };

  const handleLogout = async () => {
    // Implement logout logic here (clear cookie)
    // For now just redirect
    router.push('/login');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load data</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard ({data.user.name})</h1>
          <div className="flex items-center space-x-2">
            <NotificationButton />
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Chat with Manitto (Anonymous) */}
            {data.manittoId ? (
              <Link href={`/chat/${getRoomId(data.user.id, data.manittoId)}`} className="block">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer p-6 flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <User className="text-indigo-600" size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">비밀친구 (My Manitto)</h3>
                    <p className="text-sm text-gray-500">나를 챙겨주는 비밀친구와의 대화</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg text-gray-500">
                아직 마니또가 배정되지 않았습니다.
              </div>
            )}

            {/* Chat with Target (Real Name) */}
            {data.target ? (
              <Link href={`/chat/${getRoomId(data.user.id, data.target.id)}`} className="block">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer p-6 flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <MessageCircle className="text-green-600" size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">내 마니또 대상 ({data.target.name})</h3>
                    <p className="text-sm text-gray-500">내가 챙겨야 할 사람과의 대화</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg text-gray-500">
                아직 대상이 배정되지 않았습니다.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
