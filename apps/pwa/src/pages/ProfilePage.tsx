import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "@car-marketplace/types";
import { api } from "../api";
import { useAuthStore } from "../store";
import { PageHeader } from "../components/BackButton";
import { GoogleGmailButton } from "../components/GoogleGmailButton";
import { getBrandName } from "../lib/vehicle";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, accessToken, setAuth, logout } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [listings, setListings] = useState<Vehicle[]>([]);

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

  useEffect(() => {
    if (!accessToken || !user) {
      setListings([]);
      return;
    }
    api
      .getVehicles({ sellerId: user._id, limit: 50 }, accessToken)
      .then((res) => setListings(res.data ?? []))
      .catch(() => setListings([]));
  }, [accessToken, user]);

  if (accessToken && user) {
    return (
      <div className="screen">
        <PageHeader title="Profile" subtitle="Your Dirshay account." />
        <div className="profile-card">
          <div className="profile-avatar">{user.firstName.charAt(0).toUpperCase()}</div>
          <h2 className="profile-name">
            {user.firstName} {user.lastName}
          </h2>
          <p className="profile-email">{user.email}</p>
          <div className="role">{user.role}</div>
        </div>
        <button type="button" className="btn" onClick={() => navigate("/sell")}>
          Sell / post a car
        </button>
        {listings.length > 0 ? (
          <section className="section">
            <div className="section-head">
              <h2>My listings</h2>
            </div>
            {listings.map((v) => (
              <button
                key={v._id}
                type="button"
                className="my-listing"
                onClick={() =>
                  v.status === "APPROVED"
                    ? navigate(`/vehicle/${v.slug}`)
                    : undefined
                }
              >
                <div>
                  <strong>
                    {getBrandName(v)} {v.title}
                  </strong>
                  <p className="meta">
                    {v.listingType?.name || v.condition} · {v.year}
                  </p>
                </div>
                <span className={`status-pill ${v.status.toLowerCase()}`}>
                  {v.status}
                </span>
              </button>
            ))}
          </section>
        ) : (
          <p className="form-hint">No listings yet. Post a car to send it for approval.</p>
        )}
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
