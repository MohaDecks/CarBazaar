"use client";

import { useEffect, useState } from "react";
import { adminFetch, useAuthStore } from "@/lib/auth";
import type { Brand } from "@car-marketplace/types";

export default function AdminBrandsPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");

  function load() {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`)
      .then((r) => r.json())
      .then((json) => setBrands(json.data ?? []));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function addBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    await adminFetch("/brands", token, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  }

  async function remove(id: string) {
    if (!token) return;
    await adminFetch(`/brands/${id}`, token, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Brands</h1>
      <form onSubmit={addBrand} className="mt-6 flex max-w-md gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Brand name"
          className="h-10 flex-1 border border-gray-300 px-3 text-sm"
        />
        <button
          type="submit"
          className="h-10 bg-accent px-4 text-sm text-white"
        >
          Add
        </button>
      </form>
      <ul className="mt-6 divide-y bg-white shadow-sm">
        {brands.map((b) => (
          <li
            key={b._id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span>
              {b.name}{" "}
              <span className="text-gray-400">({b.vehicleCount ?? 0})</span>
            </span>
            <button
              type="button"
              onClick={() => remove(b._id)}
              className="text-xs text-semantic-error"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
