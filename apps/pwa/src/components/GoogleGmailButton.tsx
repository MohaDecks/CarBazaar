import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID } from "../theme";

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
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleGmailButton({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || disabled) return;

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
        if (retries++ < 40) timer = window.setTimeout(init, 50);
        return;
      }
      el.innerHTML = "";
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
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
  }, [disabled]);

  if (!GOOGLE_CLIENT_ID) {
    return <p className="muted-note">Gmail sign-in is not configured yet.</p>;
  }

  return (
    <div>
      <div ref={hostRef} className="google-host" />
      {!ready ? <p className="muted-note">Loading Gmail…</p> : null}
    </div>
  );
}
