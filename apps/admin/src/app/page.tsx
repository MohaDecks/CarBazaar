"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("admin@carmarketplace.et");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      const role = json.data.user.role;
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        throw new Error("Admin access required");
      }
      setAuth(json.data.user, json.data.tokens.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-charcoal px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 bg-white p-8"
      >
        <div>
          <p className="font-display text-2xl font-bold">
            Moto<span className="text-accent">ra</span>
          </p>
          <h1 className="mt-1 text-sm text-gray-500">Admin Portal</h1>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full border border-gray-300 px-3 text-sm"
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full border border-gray-300 px-3 text-sm"
          placeholder="Password"
          required
        />
        {error && <p className="text-sm text-semantic-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-accent text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
