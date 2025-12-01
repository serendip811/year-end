'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { addDebugLog } from './FCMDebugger';

export default function NotificationButton() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if notifications are enabled
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsEnabled(Notification.permission === 'granted');
        }
    }, []);

    const handleToggle = async () => {
        if (loading) return;

        if (isEnabled) {
            // Disable notifications - delete token
            await handleDisableNotifications();
        } else {
            // Enable notifications - request permission and save token
            await handleEnableNotifications();
        }
    };

    const handleEnableNotifications = async () => {
        setLoading(true);
        try {
            // First, request permission
            addDebugLog('🔔 [Button] Requesting permission...');
            const permission = await Notification.requestPermission();
            addDebugLog(`📋 [Button] Permission result: ${permission}`);

            if (permission !== 'granted') {
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
                    setIsEnabled(true);
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

    const handleDisableNotifications = async () => {
        setLoading(true);
        try {
            addDebugLog('🔕 [Button] Disabling notifications...');
            
            // Delete token from server
            const response = await fetch('/api/push/delete-token', {
                method: 'POST',
            });

            addDebugLog(`📡 [Button] Delete response: ${response.status}`);

            if (response.ok) {
                setIsEnabled(false);
                addDebugLog('✅ [Button] Token deleted!');
                toast.success('알림이 비활성화되었습니다');
            } else {
                const errorText = await response.text();
                addDebugLog(`❌ [Button] Delete error: ${errorText}`);
                toast.error('알림 비활성화에 실패했습니다');
            }
        } catch (error: any) {
            addDebugLog(`❌ [Button] Error: ${error.message}`);
            toast.error(`알림 비활성화 중 오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
            } ${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}
