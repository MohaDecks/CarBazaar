"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Box, Play, RotateCcw } from "lucide-react";
import type { Vehicle } from "@car-marketplace/types";
import { mediaUrl, cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Vehicle360Viewer } from "@/components/vehicles/vehicle-360-viewer";

const Vehicle3DViewer = dynamic(
  () =>
    import("@/components/vehicles/vehicle-3d-viewer").then(
      (m) => m.Vehicle3DViewer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-vehicle items-center justify-center bg-gray-100 text-sm text-gray-500">
        Loading 3D viewer…
      </div>
    ),
  }
);

interface VehicleGalleryProps {
  vehicle: Vehicle;
}

type MediaTab = "gallery" | "360" | "video" | "3d";

export function VehicleGallery({ vehicle }: VehicleGalleryProps) {
  const images =
    vehicle.images?.length > 0
      ? vehicle.images
      : [{ url: vehicle.mainImage, type: "MAIN" as const, order: 0 }];

  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<MediaTab>("gallery");
  const [imgError, setImgError] = useState(false);
  const [show3d, setShow3d] = useState(false);

  const has3d = Boolean(vehicle.model3d?.url);
  const hasVideo = Boolean(vehicle.video);
  const has360 = useMemo(() => {
    if ((vehicle.gallery360?.length ?? 0) >= 2) return true;
    return images.length >= 2;
  }, [vehicle.gallery360, images.length]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTab("gallery");
            setShow3d(false);
          }}
          className={cn(
            "h-9 px-3 text-sm",
            tab === "gallery"
              ? "bg-brand-charcoal text-white"
              : "bg-gray-100 text-gray-600"
          )}
        >
          Front
        </button>
        {has360 && (
          <button
            type="button"
            onClick={() => {
              setTab("360");
              setShow3d(false);
            }}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 px-3 text-sm",
              tab === "360"
                ? "bg-accent text-white"
                : "bg-accent-light text-accent"
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" /> 360° View
          </button>
        )}
        {hasVideo && (
          <button
            type="button"
            onClick={() => {
              setTab("video");
              setShow3d(false);
            }}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 px-3 text-sm",
              tab === "video"
                ? "bg-brand-charcoal text-white"
                : "bg-gray-100 text-gray-600"
            )}
          >
            <Play className="h-3.5 w-3.5" /> Video
          </button>
        )}
        {has3d && (
          <button
            type="button"
            onClick={() => {
              setTab("3d");
              setShow3d(true);
            }}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 px-3 text-sm",
              tab === "3d"
                ? "bg-accent text-white"
                : "bg-accent-light text-accent"
            )}
          >
            <Box className="h-3.5 w-3.5" /> View in 3D
          </button>
        )}
      </div>

      {tab === "gallery" && (
        <>
          <div className="relative aspect-vehicle w-full overflow-hidden bg-gray-100">
            {!imgError ? (
              <Image
                src={mediaUrl(images[active]?.url ?? vehicle.mainImage, "detail")}
                alt={vehicle.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Image unavailable
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.slice(0, 8).map((img, i) => (
                <button
                  key={`${img.url}-${i}`}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setImgError(false);
                  }}
                  className={cn(
                    "relative h-16 w-24 shrink-0 overflow-hidden bg-gray-100",
                    active === i
                      ? "ring-2 ring-accent"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  <Image
                    src={mediaUrl(img.thumbnailUrl ?? img.url, "thumb")}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "360" && <Vehicle360Viewer vehicle={vehicle} />}

      {tab === "video" && vehicle.video && (
        <div className="aspect-video overflow-hidden bg-black">
          <video
            src={mediaUrl(vehicle.video)}
            controls
            className="h-full w-full"
          />
        </div>
      )}

      {tab === "3d" && show3d && vehicle.model3d?.url && (
        <Vehicle3DViewer
          url={mediaUrl(vehicle.model3d.url)}
          onError={() => {
            setTab("gallery");
            setShow3d(false);
          }}
        />
      )}
    </div>
  );
}
