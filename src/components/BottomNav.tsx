'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    // Don't show bottom nav on login or chat room pages (optional, but usually chat room has its own input bar)
    // Actually, user asked for "Dashboard / Chat" tabs.
    // If we are in a specific chat room, we might want to hide it to give more space, or keep it.
    // Let's hide it in specific chat rooms `/chat/[id]` but show it on `/dashboard` and `/chats`.
    if (pathname.startsWith('/chat/') && pathname.split('/').length > 2) {
        return null;
    }
    if (pathname === '/login' || pathname === '/change-password') {
        return null;
    }

    return (
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
            <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-indigo-600' : 'text-gray-500'}`}>
                <Home size={24} />
                <span className="text-xs mt-1">홈</span>
            </Link>
            <Link href="/chats" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/chats') ? 'text-indigo-600' : 'text-gray-500'}`}>
                <MessageCircle size={24} />
                <span className="text-xs mt-1">채팅</span>
            </Link>
            {/* Optional: Profile or Settings tab */}
            {/* <Link href="/profile" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/profile') ? 'text-indigo-600' : 'text-gray-500'}`}>
        <User size={24} />
        <span className="text-xs mt-1">내 정보</span>
      </Link> */}
        </div>
    );
}
