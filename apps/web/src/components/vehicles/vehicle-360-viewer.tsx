"use client";

import { useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Vehicle } from "@car-marketplace/types";
import { mediaUrl, cn } from "@/lib/utils";

interface Vehicle360ViewerProps {
  vehicle: Vehicle;
}

function resolveFrames(vehicle: Vehicle): string[] {
  const from360 = (vehicle.gallery360 ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((img) => mediaUrl(img.url));

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
    .filter((img) => angleTypes.has(img.type))
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((img) => mediaUrl(img.url));

  const unique = Array.from(new Set(fromGallery));
  if (unique.length >= 2) return unique;

  return vehicle.mainImage ? [mediaUrl(vehicle.mainImage)] : [];
}

export function Vehicle360Viewer({ vehicle }: Vehicle360ViewerProps) {
  const frames = useMemo(() => resolveFrames(vehicle), [vehicle]);
  const [index, setIndex] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startIndex = useRef(0);
  const canSpin = frames.length > 1;

  function onPointerDown(e: React.PointerEvent) {
    if (!canSpin) return;
    dragging.current = true;
    startX.current = e.clientX;
    startIndex.current = index;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !canSpin) return;
    const delta = Math.round(-(e.clientX - startX.current) / 28);
    const next =
      (((startIndex.current + delta) % frames.length) + frames.length) %
      frames.length;
    setIndex(next);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  if (frames.length === 0) {
    return (
      <div className="flex aspect-vehicle items-center justify-center bg-gray-100 text-sm text-gray-500">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-vehicle select-none overflow-hidden bg-gray-100",
          canSpin && "cursor-ew-resize"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frames[index]}
          alt={`${vehicle.title} 360 view`}
          className="h-full w-full object-cover object-center pointer-events-none"
          draggable={false}
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          <RotateCcw className="h-3 w-3" />
          360°
        </div>
        {canSpin && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-white">
              Drag to rotate
            </span>
          </div>
        )}
      </div>

      {canSpin && (
        <div className="flex items-center justify-center gap-1.5">
          {frames.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-accent" : "w-1.5 bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
