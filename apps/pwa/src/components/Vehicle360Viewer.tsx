import { useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Vehicle, VehicleImage as VehicleImageType } from "@car-marketplace/types";
import { mediaUrl } from "../lib/vehicle";

function resolveFrames(vehicle: Vehicle): string[] {
  const from360 = (vehicle.gallery360 ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((img) => mediaUrl(img.url))
    .filter(Boolean) as string[];
  if (from360.length >= 2) return from360;

  const angleTypes = new Set([
    "MAIN",
    "FRONT",
    "LEFT",
    "REAR",
    "RIGHT",
    "ADDITIONAL",
    "GALLERY_360",
  ]);

  const fromGallery = (vehicle.images ?? [])
    .filter((img: VehicleImageType) => angleTypes.has(img.type))
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((img) => mediaUrl(img.url))
    .filter(Boolean) as string[];

  const unique = Array.from(new Set(fromGallery));
  if (unique.length >= 2) return unique;
  const main = mediaUrl(vehicle.mainImage);
  return main ? [main] : [];
}

export function Vehicle360Viewer({ vehicle }: { vehicle: Vehicle }) {
  const frames = useMemo(() => resolveFrames(vehicle), [vehicle]);
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const startIndex = useRef(0);
  const canSpin = frames.length > 1;

  function onPointerDown(e: React.PointerEvent) {
    if (!canSpin) return;
    startX.current = e.clientX;
    startIndex.current = index;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!canSpin || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const delta = Math.round(-(e.clientX - startX.current) / 28);
    const next =
      (((startIndex.current + delta) % frames.length) + frames.length) %
      frames.length;
    setIndex(next);
  }

  if (frames.length === 0) {
    return <div className="photo-wrap placeholder">No images available</div>;
  }

  return (
    <div>
      <div
        className="viewer-media"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <img src={frames[index]} alt="" draggable={false} />
        <div className="viewer-badge">
          <RotateCcw size={12} strokeWidth={2.5} />
          360°
        </div>
        {canSpin ? (
          <div className="viewer-hint">
            <span>Drag to rotate</span>
          </div>
        ) : null}
      </div>
      {canSpin ? (
        <div className="dots">
          {frames.map((_, i) => (
            <span key={i} className={`dot${i === index ? " active" : ""}`} />
          ))}
        </div>
      ) : (
        <p className="muted-note" style={{ marginTop: 8 }}>
          Add more exterior photos for a full 360° spin.
        </p>
      )}
    </div>
  );
}
