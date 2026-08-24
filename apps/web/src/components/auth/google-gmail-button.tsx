"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            el: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

interface GoogleGmailButtonProps {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}

export function GoogleGmailButton({
  onCredential,
  disabled,
}: GoogleGmailButtonProps) {
  const { t } = useI18n();
  const hostRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  useEffect(() => {
    if (!clientId || disabled) return;

    let cancelled = false;
    let timer: number | undefined;
    let retries = 0;

    const existing = document.querySelector<HTMLScriptElement>(
      "script[src='https://accounts.google.com/gsi/client']"
    );

    function init() {
      if (cancelled) return;
      const google = window.google;
      const el = hostRef.current;
      if (!google || !el) {
        if (retries++ < 40) {
          timer = window.setTimeout(init, 50);
        }
        return;
      }
      el.innerHTML = "";
      google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        callback: (response) => {
          void onCredentialRef.current(response.credential);
        },
      });
      google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: el.offsetWidth || 320,
        logo_alignment: "left",
      });
      setReady(true);
    }

    if (existing && window.google) {
      init();
    } else {
      const script = existing ?? document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = init;
      if (!existing) document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [clientId, disabled]);

  if (!clientId) {
    return (
      <p className="rounded-md border border-dashed border-gray-300 px-3 py-3 text-center text-xs text-gray-400">
        {t("auth.googleNotConfigured")}
      </p>
    );
  }

  return (
    <div className="w-full">
      <div ref={hostRef} className="flex min-h-11 w-full justify-center" />
      {!ready && (
        <p className="mt-1 text-center text-xs text-gray-400">
          {t("auth.loadingGoogle")}
        </p>
      )}
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-brand-surface px-3 text-gray-400">{label}</span>
      </div>
    </div>
  );
}
