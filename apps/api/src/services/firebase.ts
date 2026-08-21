import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

let messaging: Messaging | null | undefined;

export function getFirebaseMessaging(): Messaging | null {
  if (messaging !== undefined) return messaging;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.info(
      "Firebase Admin not configured (FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY). In-app notifications still work."
    );
    messaging = null;
    return messaging;
  }

  privateKey = privateKey.replace(/\\n/g, "\n");

  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    messaging = getMessaging();
    return messaging;
  } catch (err) {
    console.warn("Failed to init Firebase Admin:", err);
    messaging = null;
    return messaging;
  }
}
