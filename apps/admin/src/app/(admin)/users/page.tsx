"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, useAuthStore } from "@/lib/auth";
import type { User, UserRole } from "@car-marketplace/types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "CUSTOMER", label: "Buy cars (Customer)" },
  { value: "SELLER", label: "Sell my car (Seller)" },
  { value: "DEALER", label: "Register as dealer (Dealer)" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
}

function emptyForm(): EditForm {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
    isActive: true,
  };
}

export default function AdminUsersPage() {
  const token = useAuthStore((s) => s.accessToken);
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (query.trim()) params.set("q", query.trim());
    if (roleFilter) params.set("role", roleFilter);

    adminFetch<{ data: User[] }>(`/admin/users?${params}`, token)
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [token, query, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role,
      isActive: user.isActive,
    });
    setError("");
    setSuccess("");
  }

  function closeEdit() {
    setEditing(null);
    setForm(emptyForm());
    setError("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editing) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await adminFetch<{ data: User; message?: string }>(
        `/admin/users/${editing._id}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            role: form.role,
            isActive: form.isActive,
          }),
        }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === editing._id ? { ...u, ...res.data } : u))
      );
      setSuccess(res.message || "User updated");
      setTimeout(() => {
        closeEdit();
        setSuccess("");
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const availableRoles =
    currentUser?.role === "SUPER_ADMIN"
      ? ROLE_OPTIONS
      : ROLE_OPTIONS.filter(
          (r) => r.value !== "ADMIN" && r.value !== "SUPER_ADMIN"
        );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit names, roles, and account status
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="h-10 w-52 border border-gray-300 bg-white px-3 text-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 border border-gray-300 bg-white px-3 text-sm"
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100">
                  <td className="p-4 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 text-gray-500">{u.phone || "—"}</td>
                  <td className="p-4">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        u.isActive
                          ? "text-accent"
                          : "text-semantic-error"
                      }
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      disabled={u._id === currentUser?._id}
                      className="h-8 rounded bg-brand-charcoal px-3 text-xs font-medium text-white hover:bg-brand-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Edit user
                </h2>
                <p className="text-xs text-gray-500">{editing.email}</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="text-sm text-gray-500 hover:text-brand-charcoal"
              >
                Close
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="text-gray-600">First name</span>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    className="mt-1 h-10 w-full border border-gray-300 px-3 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-gray-600">Last name</span>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    className="mt-1 h-10 w-full border border-gray-300 px-3 text-sm"
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="text-gray-600">Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="mt-1 h-10 w-full border border-gray-300 px-3 text-sm"
                />
              </label>

              <label className="block text-sm">
                <span className="text-gray-600">Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+251…"
                  className="mt-1 h-10 w-full border border-gray-300 px-3 text-sm"
                />
              </label>

              <label className="block text-sm">
                <span className="text-gray-600">I want to / Role</span>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      role: e.target.value as UserRole,
                    }))
                  }
                  className="mt-1 h-10 w-full border border-gray-300 bg-white px-3 text-sm"
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-gray-400">
                  Same options as registration: Buy cars, Sell my car, Dealer
                </span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                Account active
              </label>

              {error && (
                <p className="text-sm text-semantic-error">{error}</p>
              )}
              {success && (
                <p className="text-sm text-accent">{success}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-10 border border-gray-300 px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
