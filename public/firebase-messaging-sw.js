/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBW2k1X1w584d6PHOlW_Y1GwR0u-efRqZw",
  authDomain: "sql-auto-grader.firebaseapp.com",
  projectId: "sql-auto-grader",
  storageBucket: "sql-auto-grader.firebasestorage.app",
  messagingSenderId: "462365261662",
  appId: "1:462365261662:web:d1ea52d4d47c0d582b99cf",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "New Notification", {
    body: body || "",
    icon: "/Sql-logo.png",
  });
});
