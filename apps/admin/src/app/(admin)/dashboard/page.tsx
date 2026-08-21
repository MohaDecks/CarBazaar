"use client";

import { useEffect, useState } from "react";
import { adminFetch, useAuthStore } from "@/lib/auth";
import type { DashboardStats } from "@car-marketplace/types";

interface DashboardData {
  stats: DashboardStats;
  charts: {
    listingsOverTime: { date: string; count: number }[];
    popularBrands: { name: string; count: number }[];
    popularCategories: { name: string; count: number }[];
  };
  pendingApprovals: Array<{
    _id: string;
    title: string;
    year: number;
    status: string;
    brandId?: { name: string };
    sellerId?: { firstName: string; lastName: string; email: string };
  }>;
  recentUsers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
}

export default function DashboardPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    adminFetch<{ data: DashboardData }>("/admin/stats", token)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) {
    return <p className="text-sm text-semantic-error">{error}</p>;
  }

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse bg-gray-200" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Vehicles", value: data.stats.totalVehicles },
    { label: "Published", value: data.stats.published },
    { label: "Pending", value: data.stats.pending },
    { label: "Sold", value: data.stats.sold },
    { label: "Users", value: data.stats.users },
    { label: "Dealers", value: data.stats.dealers },
  ];

  const maxListings = Math.max(
    ...data.charts.listingsOverTime.map((d) => d.count),
    1
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Marketplace overview</p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {c.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold">
            Listings (30 days)
          </h2>
          <div className="mt-4 flex h-40 items-end gap-1">
            {data.charts.listingsOverTime.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              data.charts.listingsOverTime.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 bg-accent/80 transition hover:bg-accent"
                  style={{ height: `${(d.count / maxListings) * 100}%` }}
                  title={`${d.date}: ${d.count}`}
                />
              ))
            )}
          </div>
        </section>

        <section className="bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold">
            Popular brands
          </h2>
          <ul className="mt-4 space-y-2">
            {data.charts.popularBrands.map((b) => (
              <li
                key={b.name}
                className="flex items-center justify-between text-sm"
              >
                <span>{b.name}</span>
                <span className="text-gray-500">{b.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold">
          Pending approvals
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-gray-500">
              <tr>
                <th className="pb-2 font-medium">Vehicle</th>
                <th className="pb-2 font-medium">Seller</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.pendingApprovals.map((v) => (
                <tr key={v._id} className="border-b border-gray-100">
                  <td className="py-3">
                    {v.brandId?.name} {v.title} {v.year}
                  </td>
                  <td className="py-3">
                    {v.sellerId?.firstName} {v.sellerId?.lastName}
                  </td>
                  <td className="py-3">
                    <a href="/vehicles?status=PENDING" className="text-accent">
                      Review
                    </a>
                  </td>
                </tr>
              ))}
              {data.pendingApprovals.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">
                    No pending approvals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
