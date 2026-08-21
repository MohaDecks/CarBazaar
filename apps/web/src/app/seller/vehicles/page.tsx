"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@car-marketplace/utils";
import type { Vehicle } from "@car-marketplace/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function SellerVehiclesPage() {
  const { accessToken, user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!accessToken || !user) return;
    const status = filter === "ALL" ? "" : `&status=${filter}`;
    fetch(`${API}/vehicles?sellerId=${user._id}&limit=50${status}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => setVehicles(json.data ?? []))
      .catch(() => setVehicles([]));
  }, [accessToken, user, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">My Vehicles</h1>
        <Link
          href="/seller/vehicles/new"
          className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-white"
        >
          Add Vehicle
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED", "SOLD"].map(
          (s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={
                filter === s
                  ? "rounded-md bg-brand-charcoal px-3 py-1.5 text-xs text-white"
                  : "rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
              }
            >
              {s}
            </button>
          )
        )}
      </div>

      <div className="mt-6 space-y-3">
        {vehicles.map((v) => (
          <div
            key={v._id}
            className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {v.title} · {v.year}
              </p>
              <p className="text-sm text-gray-500">
                {formatPrice(v.price)} · {v.status}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/cars/${v.slug}`}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm leading-9"
              >
                View
              </Link>
              <Link
                href={`/seller/vehicles/${v._id}/edit`}
                className="h-9 rounded-md bg-brand-charcoal px-3 text-sm leading-9 text-white"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">
            No vehicles in this filter.
          </p>
        )}
      </div>
    </div>
  );
}
