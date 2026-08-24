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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t } = useI18n();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role:
      (searchParams.get("role") as "CUSTOMER" | "SELLER" | "DEALER") ||
      "CUSTOMER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onGoogle = useCallback(
    async (idToken: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await api.loginGoogle(idToken);
        setAuth(
          res.data.user,
          res.data.tokens.accessToken,
          res.data.tokens.refreshToken
        );
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gmail sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.register(form);
      setAuth(
        res.data.user,
        res.data.tokens.accessToken,
        res.data.tokens.refreshToken
      );
      router.push(form.role === "CUSTOMER" ? "/" : "/seller");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="mt-8 space-y-4">
      {form.role === "CUSTOMER" ? (
        <>
          <GoogleGmailButton onCredential={onGoogle} disabled={loading} />
          <AuthDivider label={t("auth.orEmail")} />
        </>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-gray-600">{t("auth.firstName")}</span>
          <Input
            required
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className="mt-1"
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">{t("auth.lastName")}</span>
          <Input
            required
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            className="mt-1"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-gray-600">{t("auth.email")}</span>
        <Input
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="mt-1"
        />
      </label>
      <label className="block text-sm">
        <span className="text-gray-600">{t("auth.phone")}</span>
        <Input
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="mt-1"
          placeholder="+251…"
        />
      </label>
      <label className="block text-sm">
        <span className="text-gray-600">{t("auth.password")}</span>
        <Input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="mt-1"
        />
      </label>
      <label className="block text-sm">
        <span className="text-gray-600">{t("auth.iWantTo")}</span>
        <select
          className="mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
        >
          <option value="CUSTOMER">{t("auth.buyCars")}</option>
          <option value="SELLER">{t("auth.sellCar")}</option>
          <option value="DEALER">{t("auth.registerDealer")}</option>
        </select>
      </label>
      {error && <p className="text-sm text-semantic-error">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("common.loading") : t("auth.createAccount")}
      </Button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  const { t } = useI18n();

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold text-brand-charcoal">
          {t("auth.createAccount")}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{t("auth.createSub")}</p>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-gray-500">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
