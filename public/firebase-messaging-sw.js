// Give the service worker access to Firebase Messaging.
// Note: We need to import scripts from Firebase CDN because SW doesn't support ES modules natively in all contexts easily without bundling.
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    messagingSenderId: '436853958682', // This should be replaced or injected. 
    // Since we can't easily inject env vars into static SW without build step, 
    // we might need to hardcode or fetch config. 
    // For now, we'll assume the user replaces this or we use a workaround.
    // Actually, next-pwa might handle this if we configure it right, but usually SW is static.
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
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
