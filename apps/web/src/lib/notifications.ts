"use client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export async function getNotifications(
  token: string
): Promise<AppNotification[]> {
  const res = await fetch(`${API}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load notifications");
  return json.data ?? [];
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await fetch(`${API}/notifications/read-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function registerFcmToken(
  token: string,
  fcmToken: string
): Promise<void> {
  await fetch(`${API}/notifications/register-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token: fcmToken }),
  });
}

/**
 * Enable browser push via Firebase Messaging.
 * Requires NEXT_PUBLIC_FIREBASE_* env vars. Falls back gracefully if missing.
 */
export async function enablePushNotifications(
  authToken: string
): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!apiKey || !projectId || !vapidKey || !messagingSenderId || !appId) {
    console.info(
      "Firebase env not configured yet. Add NEXT_PUBLIC_FIREBASE_* to enable push."
    );
    return false;
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const { initializeApp, getApps } = await import("firebase/app");
    const { getMessaging, getToken, isSupported } = await import(
      "firebase/messaging"
    );

    if (!(await isSupported())) return false;

    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    };

    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    let registration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
    }

    const fcmToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!fcmToken) return false;

    await registerFcmToken(authToken, fcmToken);
    return true;
  } catch (err) {
    console.error("Failed to enable push notifications", err);
    return false;
  }
}
