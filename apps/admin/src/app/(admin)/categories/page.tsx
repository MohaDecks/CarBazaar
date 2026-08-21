"use client";

import { useEffect, useState } from "react";
import { adminFetch, useAuthStore } from "@/lib/auth";
import type { Category } from "@car-marketplace/types";

export default function AdminCategoriesPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  function load() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((r) => r.json())
      .then((json) => setCategories(json.data ?? []));
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    await adminFetch("/categories", token, {
      method: "POST",
      body: JSON.stringify({ name, order: categories.length + 1 }),
    });
    setName("");
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Categories</h1>
      <form onSubmit={addCategory} className="mt-6 flex max-w-md gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="h-10 flex-1 border border-gray-300 px-3 text-sm"
        />
        <button type="submit" className="h-10 bg-accent px-4 text-sm text-white">
          Add
        </button>
      </form>
      <ul className="mt-6 divide-y bg-white shadow-sm">
        {categories.map((c) => (
          <li key={c._id} className="flex justify-between px-4 py-3 text-sm">
            <span>{c.name}</span>
            <span className="text-gray-400">{c.vehicleCount ?? 0} vehicles</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
