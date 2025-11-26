// Give the service worker access to Firebase Messaging.
// Note: We need to import scripts from Firebase CDN because SW doesn't support ES modules natively in all contexts easily without bundling.
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBr9GAV4YfL-Onm5wMl-psu13CghOcsGGg",
    authDomain: "year-end-cc1e0.firebaseapp.com",
    projectId: "year-end-cc1e0",
    storageBucket: "year-end-cc1e0.firebasestorage.app",
    messagingSenderId: "436853958682",
    appId: "1:436853958682:web:610c633d206e61679149a3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Handle data-only messages
    const notificationTitle = payload.notification?.title || payload.data?.title;
    const notificationBody = payload.notification?.body || payload.data?.body;

    const notificationOptions = {
        body: notificationBody,
        icon: '/icons/icon-192.png',
        data: payload.data, // Pass data like room_id
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    // Handle click - open the chat room
    const roomId = event.notification.data?.room_id;
    const url = roomId ? `/chat/${roomId}` : '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
