const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "New Notification", {
    body: body || "",
    icon: "/Sql-logo.png",
  });
});
