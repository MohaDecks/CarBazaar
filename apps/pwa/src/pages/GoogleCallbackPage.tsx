import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuthStore } from "../store";

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const idToken = hash.get("id_token");
    const oauthError = hash.get("error_description") || hash.get("error");
    history.replaceState(null, "", window.location.pathname);

    if (oauthError) {
      setError(oauthError);
      return;
    }
    if (!idToken) {
      setError("Gmail did not return a sign-in token.");
      return;
    }

    void (async () => {
      try {
        const res = (await api.loginGoogle(idToken)) as {
          data: {
            user: Parameters<typeof setAuth>[0];
            tokens: { accessToken: string };
          };
        };
        setAuth(res.data.user, res.data.tokens.accessToken);
        navigate("/profile", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gmail sign-in failed");
      }
    })();
  }, [navigate, setAuth]);

  return (
    <div className="center">
      {error ? (
        <>
          <p className="error">{error}</p>
          <button type="button" className="btn btn-sm" onClick={() => navigate("/profile")}>
            Back to sign in
          </button>
        </>
      ) : (
        <>
          <div className="spinner" />
          Signing in with Gmail…
        </>
      )}
    </div>
  );
}
