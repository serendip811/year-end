'use client';

import { useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function FCMHandler() {
    useEffect(() => {
        // Auto-request disabled - user must click notification button
        // const handleToken = async () => {
        //     // Check if we're in a browser environment and if notifications are supported
        //     if (typeof window === 'undefined' || !('Notification' in window)) {
        //         console.log('Notifications not supported in this environment');
        //         return;
        //     }

        //     // Check if service workers are supported
        //     if (!('serviceWorker' in navigator)) {
        //         console.log('Service Workers not supported');
        //         return;
        //     }

        //     try {
        //         const token = await requestNotificationPermission();
        //         if (token) {
        //             console.log('FCM Token obtained:', token);
        //             // Save token to DB
        //             try {
        //                 const response = await fetch('/api/push/save-token', {
        //                     method: 'POST',
        //                     headers: { 'Content-Type': 'application/json' },
        //                     body: JSON.stringify({ token }),
        //                 });

        //                 if (response.ok) {
        //                     console.log('Token saved successfully');
        //                 } else {
        //                     console.log('Failed to save token (user might not be logged in)');
        //                 }
        //             } catch (error) {
        //                 console.error('Failed to save token', error);
        //             }
        //         } else {
        //             console.log('No FCM token obtained (permission denied or error)');
        //         }
        //     } catch (error) {
        //         console.error('Error in FCM setup:', error);
        //     }
        // };

        // handleToken();

        // Set up message listener
        try {
            onMessageListener().then((payload: any) => {
                console.log('Foreground message received:', payload);
                
                // 익명성 보호: 발신자 이름이나 내용 노출하지 않음
                toast('새로운 메시지가 도착했습니다', {
                    icon: '📩',
                    duration: 3000,
                });
            }).catch((err) => {
                console.log('Message listener error:', err);
            });
        } catch (error) {
            console.log('Could not set up message listener:', error);
        }
    }, []);

    return null;
}
