// Service Worker Version - increment to force update
const SW_VERSION = 'v1.0.1';
console.log(`[SW] Version ${SW_VERSION} loading...`);

// Give the service worker access to Firebase Messaging.
// Note: We need to import scripts from Firebase CDN because SW doesn't support ES modules natively in all contexts easily without bundling.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

console.log('[SW] Firebase Messaging SW loading...');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBr9GAV4YfL-Onm5wMl-psu13CghOcsGGg",
    authDomain: "year-end-cc1e0.firebaseapp.com",
    projectId: "year-end-cc1e0",
    storageBucket: "year-end-cc1e0.firebasestorage.app",
    messagingSenderId: "436853958682",
    appId: "1:436853958682:web:610c633d206e61679149a3"
});

console.log('[SW] Firebase initialized');

const messaging = firebase.messaging();

console.log('[SW] Messaging instance created');

// 백그라운드 메시지 핸들러
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message:', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || '새 메시지';
    const notificationBody = payload.notification?.body || payload.data?.body || '';

    const notificationOptions = {
        body: notificationBody,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'message-notification',
        requireInteraction: false,
        data: payload.data || {},
        vibrate: [200, 100, 200],
    };

    console.log('[SW] Showing notification:', notificationTitle);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification clicked:', event.notification.tag);
    event.notification.close();
    
    // Handle click - open the chat room
    const roomId = event.notification.data?.room_id;
    const url = roomId ? `/chat/${roomId}` : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // 이미 열려있는 창이 있으면 포커스
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    // URL 변경
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        url: url
                    });
                    return;
                }
            }
            // 창이 없으면 새로 열기
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Service Worker 설치 이벤트
self.addEventListener('install', (event) => {
    console.log(`[SW] ${SW_VERSION} installed`);
    // 즉시 활성화
    self.skipWaiting();
});

// Service Worker 활성화 이벤트
self.addEventListener('activate', (event) => {
    console.log(`[SW] ${SW_VERSION} activated`);
    // 모든 클라이언트 즉시 제어
    event.waitUntil(clients.claim());
});
