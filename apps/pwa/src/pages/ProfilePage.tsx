import { useState } from "react";
import { api } from "../api";
import { useAuthStore } from "../store";
import { PageHeader } from "../components/BackButton";
import { GoogleGmailButton } from "../components/GoogleGmailButton";

export function ProfilePage() {
  const { user, accessToken, setAuth, logout } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onLogin() {
    setError("");
    try {
      const res = (await api.login(email, password)) as {
        data: {
          user: Parameters<typeof setAuth>[0];
          tokens: { accessToken: string };
        };
      };
      setAuth(res.data.user, res.data.tokens.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  if (accessToken && user) {
    return (
      <div className="screen">
        <PageHeader title="Profile" subtitle="Your Motora account." />
        <div className="profile-card">
          <div className="profile-avatar">{user.firstName.charAt(0).toUpperCase()}</div>
          <h2 className="profile-name">
            {user.firstName} {user.lastName}
          </h2>
          <p className="profile-email">{user.email}</p>
          <div className="role">{user.role}</div>
        </div>
        <button type="button" className="btn-outline" onClick={logout}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <PageHeader title="Sign in" subtitle="Continue with Gmail, or use your email." />
      <div className="auth-panel">
        <GoogleGmailButton />
        <p className="or">or email</p>
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoCapitalize="none"
          placeholder="Email"
        />
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error ? <p className="error">{error}</p> : null}
        <button type="button" className="btn" onClick={onLogin}>
          Sign in
        </button>
      </div>
    </div>
  );
}
