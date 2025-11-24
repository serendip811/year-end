'use client';

import Link from 'next/link';
import { User, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
    id: string;
    name: string;
}

interface Relationships {
    user: UserInfo;
    target: UserInfo | null;
    manittoId: string | null;
}

export default function ChatsPage() {
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

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!data) return <div className="p-8 text-center">Failed to load data</div>;

    return (
        <div className="min-h-screen bg-white">
            <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h1 className="text-xl font-bold text-gray-900">채팅</h1>
            </header>

            <div className="divide-y divide-gray-100">
                {/* Chat with Manitto (Anonymous) */}
                {data.manittoId ? (
                    <Link href={`/chat/${getRoomId(data.user.id, data.manittoId)}`} className="block hover:bg-gray-50 transition-colors">
                        <div className="px-4 py-3 flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <User className="text-indigo-600" size={24} />
                                </div>
                                {/* Online status indicator could go here */}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-medium text-gray-900 truncate">비밀친구 (My Manitto)</h3>
                                    <span className="text-xs text-gray-400">Now</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">나를 챙겨주는 비밀친구와의 대화</p>
                            </div>
                        </div>
                    </Link>
                ) : null}

                {/* Chat with Target (Real Name) */}
                {data.target ? (
                    <Link href={`/chat/${getRoomId(data.user.id, data.target.id)}`} className="block hover:bg-gray-50 transition-colors">
                        <div className="px-4 py-3 flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <MessageCircle className="text-green-600" size={24} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-medium text-gray-900 truncate">내 마니또 대상 ({data.target.name})</h3>
                                    <span className="text-xs text-gray-400">Now</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">내가 챙겨야 할 사람과의 대화</p>
                            </div>
                        </div>
                    </Link>
                ) : null}

                {/* Empty State */}
                {!data.manittoId && !data.target && (
                    <div className="p-8 text-center text-gray-500">
                        아직 활성화된 채팅방이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
