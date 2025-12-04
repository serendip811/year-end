'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast';
import { useRelationships } from '@/hooks/useRelationships';
import { formatTimeKST, formatDateSeparator, isSameDay } from '@/lib/date-utils';

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
    const { data: relationships } = useRelationships();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingOlder, setFetchingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // 상대방 정보 결정
    const getChatPartnerName = () => {
        if (!relationships || !currentUserId) return 'Chat Room';
        
        const otherUserId = roomId.split('_').find(id => id !== currentUserId);
        
        if (otherUserId === relationships.manittoId) {
            return '내 마니또';
        } else if (relationships.target && otherUserId === relationships.target.id) {
            return `챙겨줄 대상 (${relationships.target.name})`;
        }
        
        return 'Chat Room';
    };

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

        try {
            const params = new URLSearchParams({
                room_id: roomId,
                limit: String(MESSAGES_PER_PAGE),
            });

            if (before) {
                params.append('before', before);
            }

            const res = await fetch(`/api/messages/list?${params}`);

            if (!res.ok) {
                toast.error('Failed to load messages');
                return;
            }

            const data = await res.json();

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
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
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

        // Update last read time on initial load
        localStorage.setItem(`last_read_${roomId}`, Date.now().toString());

        const channel = supabaseClient
            .channel(`room:${roomId}`, {
                config: {
                    broadcast: { self: false }, // 자신이 보낸 메시지는 브로드캐스트 안 받음
                },
            })
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    
                    // 중복 방지: 이미 있는 메시지면 추가하지 않음
                    setMessages((prev) => {
                        const exists = prev.some(msg => msg.id === newMessage.id);
                        if (exists) {
                            console.log('[Chat] Duplicate message ignored:', newMessage.id);
                            return prev;
                        }
                        return [...prev, newMessage];
                    });
                    
                    // Scroll to bottom on new message
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);

                    // Update last read time when new message arrives and user is in the room
                    localStorage.setItem(`last_read_${roomId}`, Date.now().toString());
                }
            )
            .subscribe();

        return () => {
            console.log('[Chat] Cleaning up channel:', roomId);
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

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            // Scroll to bottom
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);

        // Auto-resize textarea
        const textarea = e.target;
        textarea.style.height = 'auto';
        const lineHeight = 20; // approximate line height
        const maxHeight = lineHeight * 3; // 3 lines max
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-100">
            {/* Header - Fixed at top */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow px-4 py-3 flex items-center z-30 border-b border-gray-200">
                <button onClick={() => router.back()} className="mr-4 text-gray-600 hover:text-gray-800 transition-colors active:scale-95">
                    <ArrowLeft />
                </button>
                <h1 className="text-lg font-bold text-gray-800">{getChatPartnerName()}</h1>
            </div>

            {/* Messages - Scrollable with padding for fixed header/footer */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                    paddingTop: '60px', // 헤더 높이
                    paddingBottom: '70px', // 입력창 높이
                }}
            >
                {fetchingOlder && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="animate-spin text-indigo-600" size={20} />
                    </div>
                )}
                {messages.map((msg, index) => {
                    const showDateSeparator = index === 0 || !isSameDay(messages[index - 1].created_at, msg.created_at);

                    return (
                        <div key={msg.id}>
                            {showDateSeparator && (
                                <div className="flex items-center justify-center my-4">
                                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                        {formatDateSeparator(msg.created_at)}
                                    </div>
                                </div>
                            )}
                            <div
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
                                        {formatTimeKST(msg.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-3 z-30" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2 max-w-md mx-auto">
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder="메시지를 입력하세요..."
                        rows={1}
                        className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-y-auto"
                        style={{ maxHeight: '60px', minHeight: '40px' }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex-shrink-0"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
