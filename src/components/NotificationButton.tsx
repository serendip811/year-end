'use client';

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/firebase';
import toast from 'react-hot-toast';

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
            const token = await requestNotificationPermission();

            if (token) {
                // Save token to server
                const response = await fetch('/api/push/save-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (response.ok) {
                    setPermission('granted');
                    toast.success('알림이 활성화되었습니다!');
                } else {
                    toast.error('알림 설정 저장에 실패했습니다');
                }
            } else {
                setPermission(Notification.permission);
                if (Notification.permission === 'denied') {
                    toast.error('알림 권한이 차단되었습니다. 브라우저 설정에서 허용해주세요.');
                } else {
                    toast.error('알림 권한을 허용해주세요');
                }
            }
        } catch (error) {
            console.error('Notification error:', error);
            toast.error('알림 설정 중 오류가 발생했습니다');
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
