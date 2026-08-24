import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPrice, formatTransmission } from "@car-marketplace/utils";
import type { Vehicle } from "@car-marketplace/types";
import { VehicleImage } from "./VehicleImage";
import {
  compactMileage,
  compactPrice,
  conditionLabel,
  getBrandName,
} from "../lib/vehicle";
import { useFavoriteStore } from "../store";
import { colors } from "../theme";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const navigate = useNavigate();
  const favorited = useFavoriteStore((s) => s.ids.includes(vehicle._id));
  const toggle = useFavoriteStore((s) => s.toggle);
  const brand = getBrandName(vehicle);

  return (
    <article className="card" onClick={() => navigate(`/vehicle/${vehicle.slug}`)}>
      <div className="card-media">
        <VehicleImage uri={vehicle.mainImage} />
        <span className={`badge${vehicle.condition !== "USED" ? " green" : ""}`}>
          {conditionLabel(vehicle.condition)}
        </span>
        <button
          type="button"
          className={`heart${favorited ? " on" : ""}`}
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
      </div>
      <div className="card-body">
        <div className="brand">{brand || "Vehicle"}</div>
        <h3 className="card-title">{vehicle.title}</h3>
        <p className="meta">
          {vehicle.year} · {compactMileage(vehicle.mileage)} ·{" "}
          {formatTransmission(vehicle.transmission)}
        </p>
        <div className="price-row">
          <p className="price">{formatPrice(vehicle.price, vehicle.currency)}</p>
          <p className="location">{vehicle.location.city}</p>
        </div>
      </div>
    </article>
  );
}

export function FeaturedVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const navigate = useNavigate();
  const brand = getBrandName(vehicle);

  return (
    <article className="featured" onClick={() => navigate(`/vehicle/${vehicle.slug}`)}>
      <div className="featured-media">
        <VehicleImage uri={vehicle.mainImage} />
        <span className="badge green">{vehicle.featured ? "FEATURED" : "VERIFIED"}</span>
        <div className="featured-overlay">
          <h3 className="featured-title">
            {brand} {vehicle.title}
          </h3>
          <p className="featured-meta">
            {vehicle.year} · {compactMileage(vehicle.mileage)}
          </p>
          <p className="featured-price">{formatPrice(vehicle.price, vehicle.currency)}</p>
          <span className="featured-cta">View details</span>
        </div>
      </div>
    </article>
  );
}

export function CompactVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const navigate = useNavigate();
  const brand = getBrandName(vehicle);
  return (
    <article
      className="card compact"
      onClick={() => navigate(`/vehicle/${vehicle.slug}`)}
    >
      <div className="card-media">
        <VehicleImage uri={vehicle.mainImage} />
      </div>
      <div className="card-body">
        <h3 className="card-title">
          {brand} {vehicle.title}
        </h3>
        <p className="meta">{vehicle.year}</p>
        <p className="price">{compactPrice(vehicle.price, vehicle.currency)}</p>
      </div>
    </article>
  );
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
