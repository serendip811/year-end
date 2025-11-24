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
        // Check if messaging is supported
        const messagingSupported = await isSupported();
        if (!messagingSupported) {
            console.log('Firebase Messaging is not supported in this browser');
            return null;
        }

        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            return token;
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
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
