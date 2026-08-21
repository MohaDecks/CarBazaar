"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@car-marketplace/utils";
import { adminFetch, useAuthStore } from "@/lib/auth";
import type { Vehicle } from "@car-marketplace/types";

export default function AdminVehiclesPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    if (!token) return;
    const q = status ? `?status=${status}&limit=50` : "?limit=50";
    adminFetch<{ data: Vehicle[] }>(`/vehicles${q}`, token)
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  async function setVehicleStatus(
    id: string,
    next: string,
    featured?: boolean
  ) {
    if (!token) return;
    setBusy(id);
    try {
      await adminFetch(`/vehicles/${id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: next, featured }),
      });
      load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Vehicles</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {["PENDING", "APPROVED", "REJECTED", "SOLD", "DRAFT", "ARCHIVED"].map(
          (s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={
                status === s
                  ? "rounded bg-brand-charcoal px-3 py-1.5 text-xs text-white"
                  : "rounded bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm"
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
            className="flex flex-col gap-3 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {(v.brand as { name?: string })?.name} {v.title} · {v.year}
              </p>
              <p className="text-sm text-gray-500">
                {formatPrice(v.price)} · {v.status}
                {v.featured ? " · Featured" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {v.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    disabled={busy === v._id}
                    onClick={() => setVehicleStatus(v._id, "APPROVED")}
                    className="h-9 rounded bg-accent px-3 text-xs text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy === v._id}
                    onClick={() => setVehicleStatus(v._id, "REJECTED")}
                    className="h-9 rounded bg-semantic-error px-3 text-xs text-white"
                  >
                    Reject
                  </button>
                </>
              )}
              {v.status === "APPROVED" && (
                <>
                  <button
                    type="button"
                    disabled={busy === v._id}
                    onClick={() =>
                      setVehicleStatus(v._id, "APPROVED", !v.featured)
                    }
                    className="h-9 rounded border border-gray-300 px-3 text-xs"
                  >
                    {v.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    type="button"
                    disabled={busy === v._id}
                    onClick={() => setVehicleStatus(v._id, "SOLD")}
                    className="h-9 rounded border border-gray-300 px-3 text-xs"
                  >
                    Mark sold
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {vehicles.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">
            No vehicles with this status.
          </p>
        )}
      </div>
    </div>
  );
}
