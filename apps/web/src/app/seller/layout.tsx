"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LINKS = [
  { href: "/seller", label: "Dashboard" },
  { href: "/seller/vehicles", label: "My Vehicles" },
  { href: "/seller/vehicles/new", label: "Add Vehicle" },
  { href: "/seller/messages", label: "Messages" },
  { href: "/seller/profile", label: "Profile" },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login?redirect=/seller");
    }
  }, [accessToken, router]);

  if (!accessToken) {
    return (
      <div className="container-page py-16 text-center text-sm text-gray-500">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col gap-8 py-8 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-56">
        <p className="mb-4 text-xs uppercase tracking-wider text-gray-500">
          Seller · {user?.firstName}
        </p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
                pathname === link.href
                  ? "bg-brand-charcoal text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
