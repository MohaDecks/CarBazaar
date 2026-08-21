"use client";

import { useAuthStore } from "@/store/auth";

export default function SellerProfilePage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Profile</h1>
      <div className="mt-6 max-w-md space-y-3 bg-white p-6 text-sm">
        <p>
          <span className="text-gray-500">Name</span>
          <br />
          {user?.firstName} {user?.lastName}
        </p>
        <p>
          <span className="text-gray-500">Email</span>
          <br />
          {user?.email}
        </p>
        <p>
          <span className="text-gray-500">Role</span>
          <br />
          {user?.role}
        </p>
        <p>
          <span className="text-gray-500">Phone</span>
          <br />
          {user?.phone || "—"}
        </p>
      </div>
    </div>
  );
}
