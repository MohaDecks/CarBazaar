import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatFuel, formatPrice, formatTransmission } from "@car-marketplace/utils";
import type { Vehicle } from "@car-marketplace/types";
import { VehicleImage } from "./VehicleImage";
import { conditionLabel, getBrandName } from "../lib/vehicle";
import { useFavoriteStore } from "../store";
import { colors } from "../theme";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const navigate = useNavigate();
  const favorited = useFavoriteStore((s) => s.ids.includes(vehicle._id));
  const toggle = useFavoriteStore((s) => s.toggle);
  const brand = getBrandName(vehicle);

  return (
    <article className="list-card" onClick={() => navigate(`/vehicle/${vehicle.slug}`)}>
      <div className="thumb">
        <VehicleImage uri={vehicle.mainImage} />
        <span className={`badge${vehicle.condition !== "USED" ? " green" : ""}`}>
          {vehicle.listingType?.name || conditionLabel(vehicle.condition)}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 className="card-title">
          {brand} {vehicle.title}
        </h3>
        <p className="specs-inline">
          {formatTransmission(vehicle.transmission)} · {formatFuel(vehicle.fuel)}
        </p>
        <p className="price">{formatPrice(vehicle.price, vehicle.currency)}</p>
        <p className="location">{vehicle.location.city}</p>
      </div>
      <button
        type="button"
        className={`heart${favorited ? " on" : ""}`}
        style={{ position: "relative", top: 0, right: 0 }}
        aria-label={favorited ? "Remove favorite" : "Add favorite"}
        onClick={(e) => {
          e.stopPropagation();
          toggle(vehicle._id);
        }}
      >
        <Heart
          size={16}
          color={favorited ? colors.primary : colors.dark}
          fill={favorited ? colors.primary : "transparent"}
        />
      </button>
    </article>
  );
}

export function FeaturedVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return <VehicleCard vehicle={vehicle} />;
}

export function CompactVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return <VehicleCard vehicle={vehicle} />;
}

export function BrandScroller({
  brands,
}: {
  brands: { _id: string; name: string; slug: string }[];
}) {
  const navigate = useNavigate();
  return (
    <div className="hscroll">
      {brands.map((brand) => (
        <button
          type="button"
          key={brand._id}
          className="brand-tile"
          onClick={() => navigate(`/search?brand=${encodeURIComponent(brand.slug)}`)}
        >
          <div className="brand-logo">{brand.name.slice(0, 2).toUpperCase()}</div>
          <div className="brand-name">{brand.name}</div>
        </button>
      ))}
    </div>
  );
}
