import Link from "next/link";
import type { Category } from "@car-marketplace/types";

const ICONS: Record<string, string> = {
  suv: "SUV",
  sedan: "SED",
  pickup: "PUP",
  truck: "TRK",
  van: "VAN",
  coupe: "CPE",
  sports: "SPT",
  electric: "EV",
  hybrid: "HYB",
  luxury: "LUX",
  motorcycle: "MOTO",
};

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
      {categories.map((cat) => (
        <Link
          key={cat._id}
          href={`/cars?category=${cat.slug}`}
          className="group flex flex-col items-center gap-2 rounded-md px-2 py-4 text-center transition hover:bg-white"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-charcoal text-[10px] font-semibold tracking-wide text-white transition group-hover:bg-accent">
            {ICONS[cat.slug] ?? cat.name.slice(0, 3).toUpperCase()}
          </span>
          <span className="text-xs font-medium text-gray-700 group-hover:text-brand-charcoal">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
