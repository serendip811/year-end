'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationButton from '@/components/NotificationButton';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
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
                // 1. React Query 캐시 초기화
                queryClient.clear();

                // 2. localStorage 초기화
                localStorage.removeItem('relationships_cache');
                // FCM 디버그 설정은 유지하려면 주석 처리
                // localStorage.removeItem('fcm_debug_enabled');

                // 3. Service Worker 캐시 초기화 (선택적)
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    try {
                        const registration = await navigator.serviceWorker.ready;
                        // Service Worker 등록 해제 대신 캐시만 삭제
                        const cacheNames = await caches.keys();
                        await Promise.all(
                            cacheNames.map(cacheName => caches.delete(cacheName))
                        );
                    } catch (swError) {
                        console.warn('Service Worker cache cleanup failed:', swError);
                    }
                }

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
                    className="w-full flex items-center justify-between p-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all duration-200 active:scale-[0.98]"
                >
                    <span className="font-medium">로그아웃</span>
                    <LogOut size={20} />
                </button>
            </div>

            {/* 버그 리포팅 안내 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                    버그 리포팅은{' '}
                    <a 
                        href="mailto:seren.kim" 
                        className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                    >
                        seren.kim
                    </a>
                    {' '}에게
                </p>
            </div>
        </div>
    );
}
