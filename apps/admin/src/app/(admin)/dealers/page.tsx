"use client";

import { useEffect, useState } from "react";
import { adminFetch, useAuthStore } from "@/lib/auth";
import type { Dealer } from "@car-marketplace/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function AdminDealersPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [status, setStatus] = useState("PENDING");

  function load() {
    if (!token) return;
    fetch(`${API}/dealers?status=${status}&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => setDealers(json.data ?? []))
      .catch(() => setDealers([]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  async function updateStatus(id: string, next: string) {
    if (!token) return;
    await fetch(`${API}/dealers/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: next }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dealers</h1>
      <div className="mt-4 flex gap-2">
        {["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={
              status === s
                ? "rounded bg-brand-charcoal px-3 py-1.5 text-xs text-white"
                : "rounded bg-white px-3 py-1.5 text-xs shadow-sm"
            }
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {dealers.map((d) => (
          <div
            key={d._id}
            className="flex flex-col gap-3 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{d.companyName}</p>
              <p className="text-sm text-gray-500">
                {d.location.city} · {d.email}
              </p>
            </div>
            {d.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateStatus(d._id, "APPROVED")}
                  className="h-9 rounded bg-accent px-3 text-xs text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(d._id, "REJECTED")}
                  className="h-9 rounded bg-semantic-error px-3 text-xs text-white"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {dealers.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">
            No dealers found.
          </p>
        )}
      </div>
    </div>
  );
}
