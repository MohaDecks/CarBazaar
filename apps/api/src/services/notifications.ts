import type { NotificationType } from "@car-marketplace/types";
import { Notification, User } from "../models";
import { getFirebaseMessaging } from "./firebase";

interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function notifyUser(input: NotifyInput) {
  const doc = await Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data,
  });

  const user = await User.findById(input.userId).select("fcmTokens");
  const tokens = user?.fcmTokens?.filter(Boolean) ?? [];
  const messaging = getFirebaseMessaging();

  if (messaging && tokens.length > 0) {
    try {
      const result = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: input.title,
          body: input.body,
        },
        data: input.data,
      });

      const stale: string[] = [];
      result.responses.forEach((res: { success: boolean; error?: { code?: string } }, i: number) => {
        if (
          !res.success &&
          (res.error?.code === "messaging/registration-token-not-registered" ||
            res.error?.code === "messaging/invalid-registration-token")
        ) {
          stale.push(tokens[i]);
        }
      });

      if (stale.length > 0) {
        await User.findByIdAndUpdate(input.userId, {
          $pull: { fcmTokens: { $in: stale } },
        });
      }
    } catch (err) {
      console.warn("FCM push failed:", err);
    }
  }

  return doc;
}
