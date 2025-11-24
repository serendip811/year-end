'use client';

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { addDebugLog } from './FCMDebugger';

export default function NotificationButton() {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof window !== 'undefined' && 'Notification' in window
            ? Notification.permission
            : 'default'
    );
    const [loading, setLoading] = useState(false);

    const handleEnableNotifications = async () => {
        setLoading(true);
        try {
            // First, request permission
            addDebugLog('🔔 [Button] Requesting permission...');
            const permission = await Notification.requestPermission();
            addDebugLog(`📋 [Button] Permission result: ${permission}`);

            if (permission !== 'granted') {
                setPermission(permission);
                addDebugLog('❌ [Button] Permission denied');
                toast.error('알림 권한이 거부되었습니다');
                setLoading(false);
                return;
            }

            // Permission granted, now get the token
            addDebugLog('🔑 [Button] Getting FCM token...');
            const token = await requestNotificationPermission();
            addDebugLog(`📦 [Button] Token: ${token ? `${token.substring(0, 20)}...` : 'NULL'}`);

            if (token) {
                // Save token to server
                addDebugLog('💾 [Button] Saving to server...');
                const response = await fetch('/api/push/save-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                addDebugLog(`📡 [Button] Server response: ${response.status}`);

                if (response.ok) {
                    setPermission('granted');
                    addDebugLog('✅ [Button] Success!');
                    toast.success('알림이 활성화되었습니다!');
                } else {
                    const errorText = await response.text();
                    addDebugLog(`❌ [Button] Server error: ${errorText}`);
                    toast.error('알림 설정 저장에 실패했습니다');
                }
            } else {
                addDebugLog('❌ [Button] No token from Firebase');
                toast.error('FCM 토큰을 가져올 수 없습니다');
            }
        } catch (error: any) {
            addDebugLog(`❌ [Button] Error: ${error.message}`);
            toast.error(`알림 설정 중 오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (permission === 'granted') {
        return (
            <button className="p-2 text-green-600" title="알림 활성화됨">
                <Bell size={24} />
            </button>
        );
    }

    return (
        <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
            title="알림 활성화"
        >
            {loading ? (
                <div className="animate-spin">⏳</div>
            ) : (
                <BellOff size={24} />
            )}
        </button>
    );
}
