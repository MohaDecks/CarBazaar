"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@car-marketplace/utils";
import { adminFetch, useAuthStore } from "@/lib/auth";
import type { ListingType, Vehicle } from "@car-marketplace/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function listingTypeName(v: Vehicle) {
  if (v.listingType?.name) return v.listingType.name;
  if (
    typeof v.listingTypeId === "object" &&
    v.listingTypeId &&
    "name" in v.listingTypeId
  ) {
    return (v.listingTypeId as { name: string }).name;
  }
  return "";
}

export default function AdminVehiclesPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [listingType, setListingType] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    if (!token) return;
    const q = new URLSearchParams({ limit: "50" });
    if (status) q.set("status", status);
    if (listingType) q.set("listingType", listingType);
    adminFetch<{ data: Vehicle[] }>(`/vehicles?${q.toString()}`, token)
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]));
  }

  useEffect(() => {
    fetch(`${API}/listing-types`)
      .then((r) => r.json())
      .then((json) => setListingTypes(json.data ?? []))
      .catch(() => setListingTypes([]));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status, listingType]);

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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Listing type
        </label>
        <select
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
          className="h-9 rounded border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="">All types</option>
          {listingTypes.map((t) => (
            <option key={t._id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
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
                {listingTypeName(v) ? ` · ${listingTypeName(v)}` : ""}
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
