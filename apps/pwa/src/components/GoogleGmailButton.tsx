import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID } from "../theme";

function redirectUri() {
  return `${window.location.origin}/profile`;
}

function startGoogleRedirect() {
  const nonce = crypto.randomUUID();
  sessionStorage.setItem("motora-google-nonce", nonce);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: "id_token",
    scope: "openid email profile",
    nonce,
    prompt: "select_account",
  });
  window.location.assign(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}

export function GoogleGmailButton({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}) {
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const idToken = hash.get("id_token");
    const oauthError = hash.get("error");
    if (!idToken && !oauthError) return;

    history.replaceState(null, "", window.location.pathname + window.location.search);

    if (oauthError) {
      setError("Gmail sign-in was cancelled.");
      return;
    }

    setBusy(true);
    void Promise.resolve(onCredentialRef.current(idToken as string))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gmail sign-in failed");
      })
      .finally(() => setBusy(false));
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return <p className="muted-note">Gmail sign-in is not configured yet.</p>;
  }

  return (
    <div>
      <button
        type="button"
        className="google-btn"
        disabled={disabled || busy}
        onClick={startGoogleRedirect}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.6 7.5l6.3 5.3C38.2 37.3 44 31.5 44 24c0-1.2-.1-2.3-.4-3.5z" />
        </svg>
        {busy ? "Signing in…" : "Continue with Gmail"}
      </button>
      {error ? <p className="error" style={{ marginTop: 10 }}>{error}</p> : null}
    </div>
  );
}
