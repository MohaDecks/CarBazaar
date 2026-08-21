import Link from "next/link";
import type { Brand } from "@car-marketplace/types";

interface BrandStripProps {
  brands: Brand[];
}

export function BrandStrip({ brands }: BrandStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      {brands.slice(0, 10).map((brand) => (
        <Link
          key={brand._id}
          href={`/cars?brand=${brand.slug}`}
          className="font-display text-sm font-semibold uppercase tracking-widest text-gray-400 transition hover:text-brand-charcoal"
        >
          {brand.name}
        </Link>
      ))}
    </div>
  );
}
