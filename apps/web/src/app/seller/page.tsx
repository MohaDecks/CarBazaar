"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@car-marketplace/utils";
import type { Vehicle } from "@car-marketplace/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function SellerDashboardPage() {
  const { accessToken, user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!accessToken || !user) return;
    fetch(`${API}/vehicles?sellerId=${user._id}&limit=50`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => setVehicles(json.data ?? []))
      .catch(() => setVehicles([]));
  }, [accessToken, user]);

  const counts = {
    total: vehicles.length,
    draft: vehicles.filter((v) => v.status === "DRAFT").length,
    pending: vehicles.filter((v) => v.status === "PENDING").length,
    published: vehicles.filter((v) => v.status === "APPROVED").length,
    sold: vehicles.filter((v) => v.status === "SOLD").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your listings and inquiries
          </p>
        </div>
        <Link
          href="/seller/vehicles/new"
          className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-white"
        >
          Add Vehicle
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: counts.total },
          { label: "Drafts", value: counts.draft },
          { label: "Pending", value: counts.pending },
          { label: "Published", value: counts.published },
          { label: "Sold", value: counts.sold },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {s.label}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold">
        Recent listings
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="py-3 font-medium">Vehicle</th>
              <th className="py-3 font-medium">Price</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Views</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.slice(0, 8).map((v) => (
              <tr key={v._id} className="border-b border-gray-100">
                <td className="py-3">
                  <Link
                    href={`/cars/${v.slug}`}
                    className="font-medium hover:text-accent"
                  >
                    {v.title} {v.year}
                  </Link>
                </td>
                <td className="py-3">{formatPrice(v.price, v.currency)}</td>
                <td className="py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                    {v.status}
                  </span>
                </td>
                <td className="py-3">{v.views}</td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No vehicles yet.{" "}
                  <Link href="/seller/vehicles/new" className="text-accent">
                    Add your first listing
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
