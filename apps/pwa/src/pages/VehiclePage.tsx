import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import {
  formatCondition,
  formatFuel,
  formatMileage,
  formatPrice,
  formatTransmission,
} from "@car-marketplace/utils";
import type { Vehicle } from "@car-marketplace/types";
import { api } from "../api";
import { VehicleImage } from "../components/VehicleImage";
import { Vehicle360Viewer } from "../components/Vehicle360Viewer";
import { BackButton } from "../components/BackButton";
import { getBrandName } from "../lib/vehicle";

type MediaMode = "photo" | "360";

export function VehiclePage() {
  const { "*": slugPath } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<MediaMode>("photo");

  useEffect(() => {
    if (!slugPath) return;
    api
      .getVehicle(slugPath)
      .then((res) => setVehicle(res.data))
      .catch(() => setVehicle(null))
      .finally(() => setLoading(false));
  }, [slugPath]);

  const can360 = useMemo(() => {
    if (!vehicle) return false;
    if ((vehicle.gallery360?.length ?? 0) >= 2) return true;
    return (vehicle.images?.length ?? 0) >= 2;
  }, [vehicle]);

  if (loading) {
    return (
      <div className="screen">
        <BackButton />
        <div className="center">
          <div className="spinner" />
          Loading
        </div>
      </div>
    );
  }
  if (!vehicle) {
    return (
      <div className="screen">
        <BackButton />
        <div className="center">Vehicle not found</div>
      </div>
    );
  }

  const brand = getBrandName(vehicle);

  return (
    <div className="screen vehicle-screen">
      <div className="vehicle-hero">
        {mode === "photo" ? (
          <div className="photo-wrap">
            <VehicleImage uri={vehicle.mainImage} />
          </div>
        ) : (
          <Vehicle360Viewer vehicle={vehicle} />
        )}
        <BackButton className="hero-back" label />
      </div>
      <div className="vehicle-sheet">
        <div className="media-tabs">
          <button
            type="button"
            className={`media-tab${mode === "photo" ? " active" : ""}`}
            onClick={() => setMode("photo")}
          >
            Front
          </button>
          <button
            type="button"
            className={`media-tab${mode === "360" ? " active" : ""}`}
            disabled={!can360}
            onClick={() => can360 && setMode("360")}
          >
            360° View
          </button>
        </div>
        <div className="condition">{formatCondition(vehicle.condition)}</div>
        <h1 className="v-title">
          {brand} {vehicle.title}
        </h1>
        <p className="meta">{vehicle.year}</p>
        <p className="v-price">{formatPrice(vehicle.price, vehicle.currency)}</p>
        <p className="loc-row">
          <MapPin size={14} strokeWidth={2} />
          {vehicle.location.city}, Ethiopia
        </p>
        <div className="specs">
          {(
            [
              ["Mileage", formatMileage(vehicle.mileage)],
              ["Fuel", formatFuel(vehicle.fuel)],
              ["Transmission", formatTransmission(vehicle.transmission)],
              ["Engine", vehicle.engine],
              ["Color", vehicle.color],
            ] as [string, string | undefined][]
          )
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} className="spec-row">
                <span className="spec-label">{label}</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
        </div>
        <h2 className="section-label">Description</h2>
        <p className="description">{vehicle.description}</p>
      </div>
    </div>
  );
}
