"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, User, X, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useI18n } from "@/i18n/provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/layout/notification-bell";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { t } = useI18n();

  const NAV = [
    { href: "/cars", label: t("nav.cars") },
    { href: "/dealers", label: t("nav.dealers") },
    { href: "/sell", label: t("nav.sell") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-brand-surface/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-bold tracking-tight text-brand-charcoal">
            Drive
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-accent">
            ET
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "text-accent"
                  : "text-gray-600 hover:text-brand-charcoal"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <LanguageSwitcher />
          <Link
            href="/cars"
            className="flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
            aria-label={t("nav.search")}
          >
            <Search className="h-4 w-4" />
          </Link>
          {user && (
            <>
              <NotificationBell />
              <Link
                href="/favorites"
                className="flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
                aria-label={t("nav.favorites")}
              >
                <Heart className="h-4 w-4" />
              </Link>
            </>
          )}
          {user ? (
            <div className="flex items-center gap-3 ps-1">
              <Link
                href={
                  ["SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"].includes(
                    user.role
                  )
                    ? "/seller"
                    : "/profile"
                }
                className="flex items-center gap-2 text-sm font-medium text-brand-charcoal"
              >
                <User className="h-4 w-4" />
                {user.firstName}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-gray-500 hover:text-brand-charcoal"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="ms-1 inline-flex h-10 items-center rounded-md bg-brand-charcoal px-4 text-sm font-medium text-white hover:bg-brand-black"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          {user && <NotificationBell />}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-brand-surface md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-2 py-3 text-base font-medium text-brand-charcoal"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={user ? "/profile" : "/login"}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white"
            >
              {user ? t("nav.account") : t("nav.signIn")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
