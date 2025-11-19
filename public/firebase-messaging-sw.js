importScripts(
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js'
);

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCl0JgqpCx4QyNY_dhQiD8WWECVw1VAaZU',
  authDomain: 'myrameswaramtrip.firebaseapp.com',
  projectId: 'myrameswaramtrip',
  storageBucket: 'myrameswaramtrip.firebasestorage.app',
  messagingSenderId: '860124711081',
  appId: '1:860124711081:web:6d2c8ba2128a67821301b8',
  measurementId: 'G-DMJ7614NRB',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  // Note: Firebase automatically displays notifications for messages with a notification payload
  // when the app is in the background. We only need to handle the notification display manually
  // if we want custom behavior or if the message only contains a data payload.

  // If you need to perform additional actions (like updating cache, analytics, etc.),
  // you can do that here without manually showing the notification.

  // Only manually show notification if there's no notification payload
  // (i.e., data-only messages)
  if (!payload.notification) {
    const notificationTitle = payload.data?.title || 'New notification';
    const notificationOptions = {
      body: payload.data?.body || '',
      icon: '/favicon-32x32.png',
      tag: payload.messageId || `notification-${Date.now()}`,
      requireInteraction: false,
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
