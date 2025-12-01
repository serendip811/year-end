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
    const [swStatus, setSwStatus] = useState<string>('확인 중...');
    const [swVersion, setSwVersion] = useState<string>('알 수 없음');

    useEffect(() => {
        // Load FCM debug setting from localStorage
        const debugEnabled = localStorage.getItem('fcm_debug_enabled') === 'true';
        setFcmDebugEnabled(debugEnabled);

        // Check Service Worker status
        const checkSW = async () => {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    const sw = registration.active || registration.installing || registration.waiting;
                    if (sw) {
                        setSwStatus(`✅ 활성화됨 (${sw.state})`);
                        // Try to get version from SW
                        try {
                            const response = await fetch('/firebase-messaging-sw.js');
                            const text = await response.text();
                            const versionMatch = text.match(/SW_VERSION = ['"](.+?)['"]/);
                            if (versionMatch) {
                                setSwVersion(versionMatch[1]);
                            }
                        } catch (e) {
                            console.error('Failed to get SW version:', e);
                        }
                    } else {
                        setSwStatus('⚠️ 등록되었으나 비활성');
                    }
                } else {
                    setSwStatus('❌ 등록 안됨');
                }
            } else {
                setSwStatus('❌ 지원 안됨');
            }
        };

        checkSW();
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

    const handleForceUpdateSW = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.unregister();
                    toast.success('Service Worker 제거 완료. 페이지를 새로고침하세요.');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    toast.error('등록된 Service Worker가 없습니다.');
                }
            }
        } catch (error) {
            console.error('SW unregister error:', error);
            toast.error('Service Worker 제거 실패');
        }
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">설정</h1>

            <div className="bg-white rounded-lg shadow p-4 space-y-4">
                <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-medium text-gray-900">푸시 알림</span>
                            <p className="text-xs text-gray-500 mt-0.5">새 메시지 알림 받기</p>
                        </div>
                        <NotificationButton />
                    </div>
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

                <div className="p-3 border-b border-gray-100">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Service Worker</span>
                            <span className="font-medium text-gray-900">{swStatus}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">SW 버전</span>
                            <span className="font-medium text-gray-900">{swVersion}</span>
                        </div>
                        <button
                            onClick={handleForceUpdateSW}
                            className="w-full mt-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Service Worker 재설정
                        </button>
                    </div>
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
