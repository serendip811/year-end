'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationButton from '@/components/NotificationButton';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const router = useRouter();
    const [fcmDebugEnabled, setFcmDebugEnabled] = useState(false);

    useEffect(() => {
        // Load FCM debug setting from localStorage
        const debugEnabled = localStorage.getItem('fcm_debug_enabled') === 'true';
        setFcmDebugEnabled(debugEnabled);
    }, []);

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

    const handleFcmDebugToggle = () => {
        const newValue = !fcmDebugEnabled;
        setFcmDebugEnabled(newValue);
        localStorage.setItem('fcm_debug_enabled', String(newValue));

        // Trigger storage event manually for same tab
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'fcm_debug_enabled',
            newValue: String(newValue),
        }));

        toast.success(newValue ? 'FCM 디버그 활성화' : 'FCM 디버그 비활성화');
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">설정</h1>

            <div className="bg-white rounded-lg shadow p-4 space-y-4">
                <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <span className="font-medium text-gray-900">알림 설정</span>
                    <NotificationButton />
                </div>

                <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <span className="font-medium text-gray-900">FCM 디버그 패널</span>
                    <button
                        onClick={handleFcmDebugToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            fcmDebugEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                fcmDebugEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
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
