"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const { user, accessToken, logout } = useAuthStore();

  if (!accessToken || !user) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-gray-500">
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>{" "}
          to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">Profile</h1>
      <div className="mt-8 max-w-md space-y-4 bg-white p-6 text-sm">
        <p>
          <span className="text-gray-500">Name</span>
          <br />
          {user.firstName} {user.lastName}
        </p>
        <p>
          <span className="text-gray-500">Email</span>
          <br />
          {user.email}
        </p>
        <p>
          <span className="text-gray-500">Role</span>
          <br />
          {user.role}
        </p>
        <div className="flex gap-3 pt-2">
          <Link href="/favorites" className="text-accent hover:underline">
            Favorites
          </Link>
          {["SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"].includes(user.role) && (
            <Link href="/seller" className="text-accent hover:underline">
              Seller dashboard
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-4 h-10 border border-gray-300 px-4 text-sm"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
