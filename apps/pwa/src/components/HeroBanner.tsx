import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Vehicle } from "@car-marketplace/types";
import { VehicleImage } from "./VehicleImage";
import { getBrandName } from "../lib/vehicle";

const ROTATE_MS = 3500;

function slidesFromVehicles(vehicles: Vehicle[]) {
  const seen = new Set<string>();
  const slides: { vehicle: Vehicle; uri: string }[] = [];

  for (const vehicle of vehicles) {
    if (seen.has(vehicle._id)) continue;
    seen.add(vehicle._id);

    const urls = (vehicle.images ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => img.url)
      .filter(Boolean);

    const unique = [...new Set(urls.length ? urls : vehicle.mainImage ? [vehicle.mainImage] : [])];
    for (const uri of unique) {
      slides.push({ vehicle, uri });
    }
  }

  return slides;
}

export function HeroBanner({ vehicles }: { vehicles: Vehicle[] }) {
  const navigate = useNavigate();
  const slides = useMemo(() => slidesFromVehicles(vehicles), [vehicles]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="hero-banner" style={{ marginTop: 18 }}>
        <div className="hero-copy">
          <h2>Find Your Perfect Car</h2>
        </div>
      </div>
    );
  }

  const current = slides[index] ?? slides[0];
  const title = `${getBrandName(current.vehicle)} ${current.vehicle.title}`.trim();

  return (
    <article
      className="hero-banner"
      style={{ marginTop: 18 }}
      onClick={() => navigate(`/vehicle/${current.vehicle.slug}`)}
    >
      <VehicleImage key={`${current.vehicle._id}-${current.uri}`} uri={current.uri} />
      <div className="hero-copy">
        <h2>Find Your Perfect Car</h2>
        <p className="featured-meta">{title}</p>
      </div>
      {slides.length > 1 ? (
        <div className="hero-dots" onClick={(e) => e.stopPropagation()}>
          {slides.length <= 8
            ? slides.map((slide, i) => (
                <button
                  key={`${slide.vehicle._id}-${slide.uri}-${i}`}
                  type="button"
                  className={`hero-dot${i === index ? " on" : ""}`}
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                />
              ))
            : (
                <span className="hero-count">
                  {index + 1}/{slides.length}
                </span>
              )}
        </div>
      ) : null}
    </article>
  );
}
