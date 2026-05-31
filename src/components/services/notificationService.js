import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, collection } from "firebase/firestore";
import { getMessagingInstance, db } from "../../firebase";

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

// Request permission and save FCM token to Firestore
export async function requestNotificationPermission(uid) {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      await setDoc(doc(db, "fcm_tokens", uid), { token, updatedAt: new Date() }, { merge: true });
    }
    return token;
  } catch (err) {
    console.error("requestNotificationPermission:", err);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback) {
  return getMessagingInstance().then(messaging => {
    if (!messaging) return () => {};
    return onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      callback({ title, body });
    });
  });
}

// Store a notification record in Firestore (to be sent by Cloud Function)
export async function sendNotificationToUsers(userIds, title, body) {
  if (!userIds.length) return;
  const ref = doc(collection(db, "notification_queue"));
  await setDoc(ref, {
    userIds,
    title,
    body,
    createdAt: new Date(),
    sent: false,
  });
}

// Notify students when an assignment is published to them
export async function notifyAssignmentAssigned(studentUids, assignmentTitle) {
  await sendNotificationToUsers(
    studentUids,
    "New Assignment",
    `You have been assigned: "${assignmentTitle}"`
  );
}

// Notify students when a quiz is assigned
export async function notifyQuizAssigned(studentUids, quizTitle) {
  await sendNotificationToUsers(
    studentUids,
    "New Quiz",
    `A new quiz is available: "${quizTitle}"`
  );
}

// Notify teacher when a student submits an assignment
export async function notifyAssignmentSubmitted(teacherUid, studentName, assignmentTitle) {
  await sendNotificationToUsers(
    [teacherUid],
    "Assignment Submitted",
    `${studentName} submitted "${assignmentTitle}"`
  );
}
