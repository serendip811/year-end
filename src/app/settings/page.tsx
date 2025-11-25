'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationButton from '@/components/NotificationButton';

export default function SettingsPage() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                toast.success('로그아웃 되었습니다.');
                router.push('/login');
                router.refresh(); // Refresh to update middleware/server state if needed
            } else {
                toast.error('로그아웃 실패');
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">설정</h1>

            <div className="bg-white rounded-lg shadow p-4 space-y-4">
                <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">알림 설정</span>
                    <NotificationButton />
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <span className="font-medium">로그아웃</span>
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
}
