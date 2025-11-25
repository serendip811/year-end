'use client';

import Link from 'next/link';
import { User, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRelationships } from '@/hooks/useRelationships';

export default function ChatsPage() {
    const { data, isLoading } = useRelationships();
    const [unreadStatus, setUnreadStatus] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (!data) return;

        const fetchUnreadStatus = async () => {
            // Fetch latest messages for rooms
            if (data.manittoId || data.target) {
                const rooms = [];
                if (data.manittoId) rooms.push([data.user.id, data.manittoId].sort().join('_'));
                if (data.target) rooms.push([data.user.id, data.target.id].sort().join('_'));

                try {
                    const res = await fetch(`/api/messages/last-message?room_ids=${rooms.join(',')}`);
                    if (!res.ok) return;

                    const lastMessages = await res.json();
                    const status: { [key: string]: boolean } = {};

                    for (const roomId of rooms) {
                        if (lastMessages[roomId]) {
                            const lastMessageTime = new Date(lastMessages[roomId]).getTime();
                            const lastReadTime = localStorage.getItem(`last_read_${roomId}`);

                            if (!lastReadTime || lastMessageTime > parseInt(lastReadTime)) {
                                status[roomId] = true;
                            }
                        }
                    }
                    setUnreadStatus(status);
                } catch (error) {
                    console.error('Error fetching unread status:', error);
                }
            }
        };

        fetchUnreadStatus();
    }, [data]);

    const getRoomId = (id1: string, id2: string) => {
        return [id1, id2].sort().join('_');
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!data) return <div className="p-8 text-center">Failed to load data</div>;

    return (
        <div className="h-full bg-white">
            <header className="px-4 py-3 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900">채팅</h1>
            </header>

            <div className="divide-y divide-gray-100">
                {/* Chat with Manitto (Anonymous) */}
                {data.manittoId ? (
                    <Link href={`/chat/${getRoomId(data.user.id, data.manittoId)}`} className="block hover:bg-gray-50 active:bg-gray-100 transition-all duration-150">
                        <div className="px-4 py-3 flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <User className="text-indigo-600" size={24} />
                                </div>
                                {unreadStatus[getRoomId(data.user.id, data.manittoId)] && (
                                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-medium text-gray-900 truncate">비밀친구 (My Manitto)</h3>
                                    {unreadStatus[getRoomId(data.user.id, data.manittoId)] && (
                                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">New</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">나를 챙겨주는 비밀친구와의 대화</p>
                            </div>
                        </div>
                    </Link>
                ) : null}

                {/* Chat with Target (Real Name) */}
                {data.target ? (
                    <Link href={`/chat/${getRoomId(data.user.id, data.target.id)}`} className="block hover:bg-gray-50 active:bg-gray-100 transition-all duration-150">
                        <div className="px-4 py-3 flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <MessageCircle className="text-green-600" size={24} />
                                </div>
                                {unreadStatus[getRoomId(data.user.id, data.target.id)] && (
                                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-medium text-gray-900 truncate">내 마니또 대상 ({data.target.name})</h3>
                                    {unreadStatus[getRoomId(data.user.id, data.target.id)] && (
                                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">New</span>
                                    )}
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
