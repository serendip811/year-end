import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Import debug logger - use dynamic import to avoid circular dependency
let addDebugLog: ((msg: string) => void) | null = null;
if (typeof window !== 'undefined') {
    import('../components/FCMDebugger').then(module => {
        addDebugLog = module.addDebugLog;
    });
}

const log = (msg: string) => {
    console.log(msg);
    if (addDebugLog) addDebugLog(msg);
};

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
        log('🔍 [Firebase] Checking support...');
        // Check if messaging is supported
        const messagingSupported = await isSupported();
        log(`✅ [Firebase] Supported: ${messagingSupported}`);

        if (!messagingSupported) {
            log('❌ [Firebase] Not supported');
            return null;
        }

        // Service Worker 등록
        log('🔧 [Firebase] Registering service worker...');
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                log(`✅ [Firebase] SW registered: ${registration.scope}`);
                
                // Service Worker가 활성화될 때까지 대기
                await navigator.serviceWorker.ready;
                log('✅ [Firebase] SW ready');
            } catch (swError: any) {
                log(`⚠️ [Firebase] SW registration error: ${swError.message}`);
            }
        }

        log('📱 [Firebase] Getting messaging...');
        const messaging = getMessaging(app);
        log('✅ [Firebase] Messaging OK');

        // Check current permission status
        log(`📋 [Firebase] Permission: ${Notification.permission}`);

        if (Notification.permission !== 'granted') {
            log('❌ [Firebase] Not granted');
            return null;
        }

        log('🔑 [Firebase] Getting token...');
        log(`🔐 [Firebase] VAPID: ${!!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY}`);

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        log(`📦 [Firebase] Token: ${token ? 'YES' : 'NO'}`);
        return token;
    } catch (error: any) {
        log(`❌ [Firebase] Error: ${error.message}`);
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
