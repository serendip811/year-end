'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';

interface Message {
    id: string;
    content: string;
    sender: string;
    created_at: string;
}

const MESSAGES_PER_PAGE = 20;

export default function ChatRoomPage() {
    const params = useParams();
    const roomId = params.room_id as string;
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingOlder, setFetchingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUserId(data.user.id);
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };
        fetchUser();
    }, []);

    const fetchMessages = useCallback(async (before?: string) => {
        if (!roomId) return;

        let query = supabaseClient
            .from('messages')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: false })
            .limit(MESSAGES_PER_PAGE);

        if (before) {
            query = query.lt('created_at', before);
        }

        const { data, error } = await query;

        if (error) {
            toast.error('Failed to load messages');
            return;
        }

        if (data) {
            if (data.length < MESSAGES_PER_PAGE) {
                setHasMore(false);
            }
            // Reverse to show oldest first in the list
            const newMessages = [...data].reverse();

            setMessages((prev) => {
                if (before) {
                    return [...newMessages, ...prev];
                } else {
                    return newMessages;
                }
            });
        }
    }, [roomId]);

    // Initial load
    useEffect(() => {
        if (!roomId) return;

        if (roomId === 'manitto' || roomId === 'target') {
            toast.error('Invalid room. Redirecting to dashboard...');
            router.push('/');
            return;
        }

        fetchMessages();

        const channel = supabaseClient
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                    // Scroll to bottom on new message
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            )
            .subscribe();

        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [roomId, fetchMessages, router]);

    // Scroll to bottom on initial load
    useEffect(() => {
        if (messages.length > 0 && !fetchingOlder && messages.length <= MESSAGES_PER_PAGE) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages, fetchingOlder]);

    const handleScroll = async () => {
        const container = chatContainerRef.current;
        if (!container || fetchingOlder || !hasMore) return;

        if (container.scrollTop === 0 && messages.length > 0) {
            setFetchingOlder(true);
            const oldestMessage = messages[0];
            const scrollHeightBefore = container.scrollHeight;

            await fetchMessages(oldestMessage.created_at);

            // Maintain scroll position
            setTimeout(() => {
                const scrollHeightAfter = container.scrollHeight;
                container.scrollTop = scrollHeightAfter - scrollHeightBefore;
                setFetchingOlder(false);
            }, 0);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUserId) return;

        setLoading(true);
        try {
            const ids = roomId.split('_');
            const receiverId = ids.find(id => id !== currentUserId);

            if (!receiverId) {
                throw new Error('Could not determine receiver ID');
            }

            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, content: newMessage, receiverId }),
            });

            if (!res.ok) throw new Error('Failed to send');

            setNewMessage('');
            // Scroll to bottom
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-100 relative">
            {/* Header - Fixed */}
            <div className="sticky top-0 bg-white shadow px-4 py-3 flex items-center z-20 border-b border-gray-200">
                <button onClick={() => router.back()} className="mr-4 text-gray-600">
                    <ArrowLeft />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Chat Room</h1>
            </div>

            {/* Messages - Scrollable */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                    height: 'calc(100vh - 120px)', // 헤더 + 입력창 높이 제외
                    maxHeight: 'calc(100vh - 120px)'
                }}
            >
                {fetchingOlder && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="animate-spin text-indigo-600" size={20} />
                    </div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.sender === currentUserId
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                                }`}
                        >
                            <p className="text-sm break-words">{msg.content}</p>
                            <span className={`text-[10px] block text-right mt-1 ${msg.sender === currentUserId ? 'text-indigo-200' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 z-20">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
