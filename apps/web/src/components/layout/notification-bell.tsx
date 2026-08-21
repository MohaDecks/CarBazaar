"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useI18n } from "@/i18n/provider";
import {
  enablePushNotifications,
  getNotifications,
  markAllNotificationsRead,
  type AppNotification,
} from "@/lib/notifications";

export function NotificationBell() {
  const { accessToken } = useAuthStore();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [enabled, setEnabled] = useState(false);

  const unread = items.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!accessToken) return;
    getNotifications(accessToken)
      .then(setItems)
      .catch(() => setItems([]));
  }, [accessToken, open]);

  if (!accessToken) return null;

  async function onEnable() {
    const ok = await enablePushNotifications(accessToken!);
    setEnabled(ok);
  }

  async function onMarkRead() {
    await markAllNotificationsRead(accessToken!);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
        aria-label={t("nav.notifications")}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 z-50 mt-1 w-80 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <p className="text-sm font-semibold">{t("notif.title")}</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={onMarkRead}
                  className="text-xs text-accent hover:underline"
                >
                  {t("notif.markRead")}
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-gray-500">
                  {t("notif.empty")}
                </p>
              ) : (
                items.map((n) => (
                  <div
                    key={n._id}
                    className={`border-b border-gray-50 px-3 py-3 ${
                      n.isRead ? "bg-white" : "bg-accent-light/40"
                    }`}
                  >
                    <p className="text-sm font-medium text-brand-charcoal">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={onEnable}
                className="w-full rounded-md px-2 py-2 text-xs font-medium text-accent hover:bg-accent-light"
              >
                {enabled ? t("notif.enabled") : t("notif.enable")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
