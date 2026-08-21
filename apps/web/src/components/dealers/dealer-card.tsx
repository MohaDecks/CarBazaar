import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { Dealer } from "@car-marketplace/types";

interface DealerCardProps {
  dealer: Dealer;
}

export function DealerCard({ dealer }: DealerCardProps) {
  return (
    <Link
      href={`/dealers/${dealer.slug}`}
      className="group flex items-center gap-4 bg-white p-5 transition hover:shadow-md"
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-charcoal text-lg font-display font-bold text-white">
        {dealer.logo ? (
          <Image
            src={dealer.logo}
            alt={dealer.companyName}
            fill
            className="object-cover"
          />
        ) : (
          dealer.companyName.charAt(0)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-base font-semibold text-brand-charcoal group-hover:text-accent">
            {dealer.companyName}
          </h3>
          {dealer.verified && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {dealer.location.city} · {dealer.stats.vehicles} vehicles
        </p>
      </div>
    </Link>
  );
}
