import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const requestNotificationPermission = async () => {
    try {
        console.log('[Firebase] Checking messaging support...');
        // Check if messaging is supported
        const messagingSupported = await isSupported();
        console.log('[Firebase] Messaging supported:', messagingSupported);

        if (!messagingSupported) {
            console.log('Firebase Messaging is not supported in this browser');
            return null;
        }

        console.log('[Firebase] Getting messaging instance...');
        const messaging = getMessaging(app);
        console.log('[Firebase] Messaging instance obtained');

        console.log('[Firebase] Requesting permission...');
        const permission = await Notification.requestPermission();
        console.log('[Firebase] Permission result:', permission);

        if (permission === 'granted') {
            console.log('[Firebase] Getting token with VAPID key...');
            console.log('[Firebase] VAPID key exists:', !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);

            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            console.log('[Firebase] Token obtained:', token ? 'YES' : 'NO');
            return token;
        } else {
            console.log('[Firebase] Permission not granted:', permission);
        }
    } catch (error) {
        console.error('[Firebase] Error occurred:', error);
    }
    return null;
};

export const onMessageListener = () =>
    new Promise(async (resolve, reject) => {
        try {
            const messagingSupported = await isSupported();
            if (!messagingSupported) {
                reject('Messaging not supported');
                return;
            }
            const messaging = getMessaging(app);
            onMessage(messaging, (payload) => {
                resolve(payload);
            });
        } catch (error) {
            reject(error);
        }
    });
