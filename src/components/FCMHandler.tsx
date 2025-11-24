'use client';

import { useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function FCMHandler() {
    useEffect(() => {
        const handleToken = async () => {
            const token = await requestNotificationPermission();
            if (token) {
                // Save token to DB
                try {
                    await fetch('/api/push/save-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token }),
                    });
                } catch (error) {
                    console.error('Failed to save token', error);
                }
            }
        };

        handleToken();

        onMessageListener().then((payload: any) => {
            toast(payload.notification.title + ': ' + payload.notification.body, {
                icon: '📩',
                duration: 5000,
            });
        });
    }, []);

    return null;
}
