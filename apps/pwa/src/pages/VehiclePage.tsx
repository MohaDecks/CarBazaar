import { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Phone, Share2 } from "lucide-react";
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
import { getBrandName, mediaUrl } from "../lib/vehicle";
import { useFavoriteStore } from "../store";
import { colors } from "../theme";
import { useNavigate, useParams } from "react-router-dom";

type MediaMode = "photo" | "360";

export function VehiclePage() {
  const navigate = useNavigate();
  const { "*": slugPath } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<MediaMode>("photo");
  const [photoIndex, setPhotoIndex] = useState(0);
  const favorited = useFavoriteStore((s) =>
    vehicle ? s.ids.includes(vehicle._id) : false
  );
  const toggle = useFavoriteStore((s) => s.toggle);

  useEffect(() => {
    if (!slugPath) return;
    api
      .getVehicle(slugPath)
      .then((res) => setVehicle(res.data))
      .catch(() => setVehicle(null))
      .finally(() => setLoading(false));
  }, [slugPath]);

  const photos = useMemo(() => {
    if (!vehicle) return [];
    const urls = (vehicle.images ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => mediaUrl(img.url, "detail") || img.url)
      .filter(Boolean);
    if (urls.length) return urls;
    const main = mediaUrl(vehicle.mainImage, "detail");
    return main ? [main] : [];
  }, [vehicle]);

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
  const seller = vehicle.seller;
  const dealer = vehicle.dealer;
  const phone = seller?.phone;
  const posted = vehicle.publishedAt || vehicle.createdAt;

  return (
    <div className="screen vehicle-screen">
      <div className="vehicle-hero">
        {mode === "photo" ? (
          <div className="photo-wrap" onClick={() => setPhotoIndex((i) => (i + 1) % Math.max(photos.length, 1))}>
            {photos[photoIndex] ? (
              <img src={photos[photoIndex]} alt="" />
            ) : (
              <VehicleImage uri={vehicle.mainImage} />
            )}
            {photos.length > 1 ? (
              <span className="photo-count">
                {photoIndex + 1}/{photos.length}
              </span>
            ) : null}
          </div>
        ) : (
          <Vehicle360Viewer vehicle={vehicle} />
        )}
        <BackButton className="hero-back" />
        <button
          type="button"
          className={`heart${favorited ? " on" : ""}`}
          style={{ zIndex: 3 }}
          aria-label="Favorite"
          onClick={() => toggle(vehicle._id)}
        >
          <Heart
            size={16}
            color={favorited ? colors.primary : colors.dark}
            fill={favorited ? colors.primary : "transparent"}
          />
        </button>
        <button
          type="button"
          className="icon-btn"
          style={{ position: "absolute", top: 16, right: 58, zIndex: 3 }}
          aria-label="Share"
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) void navigator.share({ url, title: vehicle.title });
            else void navigator.clipboard.writeText(url);
          }}
        >
          <Share2 size={16} />
        </button>
      </div>
      <div className="vehicle-sheet">
        <div className="media-tabs">
          <button
            type="button"
            className={`media-tab${mode === "photo" ? " active" : ""}`}
            onClick={() => setMode("photo")}
          >
            Photos
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
        <h1 className="v-title">
          {brand} {vehicle.title}
        </h1>
        <p className="v-price">{formatPrice(vehicle.price, vehicle.currency)}</p>
        <div className="v-tags">
          <span className="v-tag">{vehicle.year}</span>
          <span className="v-tag">{formatTransmission(vehicle.transmission)}</span>
          <span className="v-tag">{formatFuel(vehicle.fuel)}</span>
          {vehicle.drive ? <span className="v-tag">{vehicle.drive}</span> : null}
        </div>
        <div className="specs">
          {(
            [
              ["Mileage", formatMileage(vehicle.mileage)],
              ["Location", `${vehicle.location.city}`],
              ["Engine", vehicle.engine],
              ["Type", vehicle.listingType?.name],
              ["Condition", formatCondition(vehicle.condition)],
              ["Color", vehicle.color],
              ["Posted", posted ? new Date(posted).toLocaleDateString() : undefined],
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
        {seller || dealer ? (
          <div className="seller-row">
            <div className="avatar">
              {(dealer?.companyName || seller?.firstName || "D").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{dealer?.companyName || `${seller?.firstName ?? ""} ${seller?.lastName ?? ""}`}</strong>
              <p className="meta">{dealer?.verified ? "Verified Dealer" : "Seller"}</p>
            </div>
          </div>
        ) : null}
        <h2 className="section-label">Description</h2>
        <p className="description">{vehicle.description}</p>
        <div className="sticky-cta">
          {phone ? (
            <a className="btn-outline" href={`tel:${phone}`} style={{ textAlign: "center", lineHeight: "50px" }}>
              <Phone size={16} style={{ display: "inline", marginRight: 6 }} />
              Call
            </a>
          ) : (
            <button type="button" className="btn-outline" onClick={() => navigate("/messages")}>
              Call
            </button>
          )}
          <button type="button" className="btn" onClick={() => navigate("/messages")}>
            <MessageCircle size={16} style={{ marginRight: 6 }} />
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}
