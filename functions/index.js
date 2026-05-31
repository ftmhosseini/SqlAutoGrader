const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

exports.sendPushNotification = onDocumentCreated("notification_queue/{docId}", async (event) => {
  const data = event.data?.data();
  if (!data || data.sent) return;

  const { userIds, title, body } = data;
  if (!userIds?.length) return;

  // Get FCM tokens for target users
  const tokens = [];
  for (const uid of userIds) {
    const snap = await db.doc(`fcm_tokens/${uid}`).get();
    if (snap.exists) tokens.push(snap.data().token);
  }

  if (!tokens.length) {
    await event.data.ref.update({ sent: true, error: "no_tokens" });
    return;
  }

  // Send multicast message
  const message = {
    notification: { title, body },
    tokens,
  };

  const response = await getMessaging().sendEachForMulticast(message);
  await event.data.ref.update({ sent: true, successCount: response.successCount, failureCount: response.failureCount });
});
