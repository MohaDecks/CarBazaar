"use client";

import { useEffect, useState } from "react";
import { adminFetch, useAuthStore } from "@/lib/auth";
import type { ListingType } from "@car-marketplace/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function AdminListingTypesPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [types, setTypes] = useState<ListingType[]>([]);
  const [name, setName] = useState("");
  const [defaultCondition, setDefaultCondition] = useState("USED");

  function load() {
    fetch(`${API}/listing-types`)
      .then((r) => r.json())
      .then((json) => setTypes(json.data ?? []));
  }

  useEffect(() => {
    load();
  }, []);

  async function addType(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    await adminFetch("/listing-types", token, {
      method: "POST",
      body: JSON.stringify({
        name,
        defaultCondition,
        order: types.length + 1,
      }),
    });
    setName("");
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Listing types</h1>
      <p className="mt-1 text-sm text-gray-500">
        Dynamic dropdown used when posting a vehicle in the app and on the web
        (User Car, New Car, or any type you add).
      </p>
      <form onSubmit={addType} className="mt-6 flex max-w-xl flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type name, e.g. User Car"
          className="h-10 flex-1 border border-gray-300 px-3 text-sm"
        />
        <select
          value={defaultCondition}
          onChange={(e) => setDefaultCondition(e.target.value)}
          className="h-10 border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="USED">User / used</option>
          <option value="NEW">New car</option>
          <option value="CERTIFIED_USED">Certified used</option>
        </select>
        <button type="submit" className="h-10 bg-accent px-4 text-sm text-white">
          Add
        </button>
      </form>
      <ul className="mt-6 divide-y bg-white shadow-sm">
        {types.map((t) => (
          <li key={t._id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {t.name}
              <span className="ml-2 text-gray-400">
                {t.defaultCondition.replace("_", " ")}
              </span>
            </span>
            <span className="text-gray-400">{t.vehicleCount ?? 0} vehicles</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
