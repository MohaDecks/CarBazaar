import type { Metadata } from "next";
import { api } from "@/lib/api";
import { DealerCard } from "@/components/dealers/dealer-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Dealers",
  description: "Browse verified car dealers across Ethiopia.",
};

export const dynamic = "force-dynamic";

export default async function DealersPage() {
  const res = await api.getDealers({ limit: 24 }).catch(() => ({
    success: true as const,
    data: [],
    meta: {
      page: 1,
      limit: 24,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  }));

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold text-brand-charcoal">
        Premium Dealers
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Verified partners across Ethiopia
      </p>

      {res.data.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No dealers found"
          description="Check back soon for verified dealerships."
        />
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {res.data.map((d) => (
            <DealerCard key={d._id} dealer={d} />
          ))}
        </div>
      )}
    </div>
  );
}
