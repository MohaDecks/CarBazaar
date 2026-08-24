"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useI18n } from "@/i18n/provider";
import {
  AuthDivider,
  GoogleGmailButton,
} from "@/components/auth/google-gmail-button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function finishLogin(res: Awaited<ReturnType<typeof api.login>>) {
    setAuth(
      res.data.user,
      res.data.tokens.accessToken,
      res.data.tokens.refreshToken
    );
    const redirect = searchParams.get("redirect") || "/";
    router.push(redirect);
  }

  const onGoogle = useCallback(
    async (idToken: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await api.loginGoogle(idToken);
        await finishLogin(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gmail sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    // finishLogin uses latest searchParams/router/setAuth via closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, searchParams, setAuth]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password);
      await finishLogin(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <GoogleGmailButton onCredential={onGoogle} disabled={loading} />
      <AuthDivider label={t("auth.orEmail")} />
      <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-gray-600">{t("auth.email")}</span>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
          autoComplete="email"
        />
      </label>
      <label className="block text-sm">
        <span className="text-gray-600">{t("auth.password")}</span>
        <Input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1"
          autoComplete="current-password"
        />
      </label>
      {error && <p className="text-sm text-semantic-error">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold text-brand-charcoal">
          {t("auth.welcome")}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{t("auth.welcomeSub")}</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-gray-500">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            {t("auth.createOne")}
          </Link>
        </p>
      </div>
    </div>
  );
}
