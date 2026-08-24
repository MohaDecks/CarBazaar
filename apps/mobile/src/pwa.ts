import { Platform } from "react-native";

export function registerServiceWorker() {
  if (Platform.OS !== "web") return;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const nav = navigator as unknown as {
      serviceWorker?: { register: (url: string) => Promise<unknown> };
    };
    nav.serviceWorker?.register("/sw.js").catch(() => undefined);
  });
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}
