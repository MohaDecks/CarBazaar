import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import { RotateCcw } from "lucide-react-native";
import type { Vehicle, VehicleImage as VehicleImageType } from "@car-marketplace/types";
import { mediaUrl } from "../lib/vehicle";
import { colors, radius, spacing } from "../theme";

interface Vehicle360ViewerProps {
  vehicle: Vehicle;
}

/** Prefer dedicated 360 frames; otherwise exterior angle photos */
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

export function Vehicle360Viewer({ vehicle }: Vehicle360ViewerProps) {
  const frames = useMemo(() => resolveFrames(vehicle), [vehicle]);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const startIndexRef = useRef(0);
  const canSpin = frames.length > 1;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => canSpin,
        onMoveShouldSetPanResponder: (_e, g) =>
          canSpin && Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 4,
        onPanResponderGrant: () => {
          startIndexRef.current = indexRef.current;
        },
        onPanResponderMove: (
          _e: GestureResponderEvent,
          gesture: PanResponderGestureState
        ) => {
          if (!canSpin) return;
          // ~28px drag ≈ one frame
          const delta = Math.round(-gesture.dx / 28);
          const next =
            (((startIndexRef.current + delta) % frames.length) + frames.length) %
            frames.length;
          if (next !== indexRef.current) {
            indexRef.current = next;
            setIndex(next);
          }
        },
      }),
    [canSpin, frames.length]
  );

  if (frames.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No images available</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.media} {...panResponder.panHandlers}>
        <Image
          source={{ uri: frames[index] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badge}>
          <RotateCcw size={12} color={colors.white} strokeWidth={2.5} />
          <Text style={styles.badgeText}>360°</Text>
        </View>
        {canSpin && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Drag to rotate</Text>
          </View>
        )}
      </View>

      {canSpin && (
        <View style={styles.dots}>
          {frames.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      )}

      {!canSpin && (
        <Text style={styles.fallbackNote}>
          Add more exterior photos for a full 360° spin.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  media: {
    width: "100%",
    aspectRatio: 16 / 10,
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  hint: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintText: {
    backgroundColor: "rgba(17,17,17,0.7)",
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 16,
  },
  empty: {
    aspectRatio: 16 / 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
    borderRadius: radius.lg,
  },
  emptyText: {
    color: colors.secondary,
    fontSize: 13,
  },
  fallbackNote: {
    marginTop: 8,
    fontSize: 12,
    color: colors.secondary,
    textAlign: "center",
  },
});
