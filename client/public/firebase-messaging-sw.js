/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyA_DslGh8qQzS7zEzkitzSwxo4DU5EGkBg",
  authDomain: "callify-notifications.firebaseapp.com",
  projectId: "callify-notifications",
  storageBucket: "callify-notifications.firebasestorage.app",
  messagingSenderId: "205176776705",
  appId: "1:205176776705:web:0b77ec145c05d9184b3800"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
    data : payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- Handle notification clicks ---
self.addEventListener('notificationclick', (event) => {
  // console.log('[firebase-messaging-sw.js] Notification clicked');

  // Close the notification
  event.notification.close();

  // Get the URL from the data payload
  const urlToOpen = event.notification.data?.url || '/'; // Default to root if no URL is provided

  event.waitUntil(
    // Get all window clients (tabs) controlled by this service worker
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true // Important to include tabs not currently focused
    }).then((clientList) => {
      // Check if a tab with the target URL is already open
      for (const client of clientList) {
        // Use client.url.includes(urlToOpen) for partial match
        // Or client.url === urlToOpen for exact match
        // Ensure you account for protocol (http/https) and domain
        // For relative paths, you might just check client.url.endsWith(urlToOpen)
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          // If found, focus that tab
          // console.log(`[firebase-messaging-sw.js] Focusing existing client for URL: ${urlToOpen}`);
          return client.focus();
        }
      }

      // If no matching client found, open a new window/tab
      // console.log(`[firebase-messaging-sw.js] Opening new window for URL: ${urlToOpen}`);
      return self.clients.openWindow(urlToOpen);
    }).catch(error => {
      console.error('[firebase-messaging-sw.js] Error handling notification click:', error);
    })
  );
});