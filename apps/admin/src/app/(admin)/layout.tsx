"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/users", label: "Users" },
  { href: "/dealers", label: "Dealers" },
  { href: "/brands", label: "Brands" },
  { href: "/categories", label: "Categories" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export default function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, logout } = useAuthStore();

  useEffect(() => {
    if (!accessToken) router.replace("/");
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 bg-brand-charcoal text-white md:block">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-display text-xl font-bold">
            Moto<span className="text-accent-muted">ra</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-400">Admin</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname.startsWith(item.href)
                  ? "rounded-md bg-white/10 px-3 py-2 text-sm"
                  : "rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-56 border-t border-white/10 p-4 text-xs text-gray-400">
          <p>{user?.email}</p>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-2 text-accent-muted hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
          <nav className="flex gap-3 overflow-x-auto text-sm md:hidden">
            {NAV.slice(0, 4).map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="hidden text-sm text-gray-500 md:block">
            {user?.firstName} {user?.lastName}
          </p>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
