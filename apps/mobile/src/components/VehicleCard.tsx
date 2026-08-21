import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { formatPrice, formatTransmission } from "@car-marketplace/utils";
import type { Vehicle } from "@car-marketplace/types";
import { VehicleImage } from "./VehicleImage";
import {
  getBrandName,
  compactMileage,
  conditionLabel,
} from "../lib/vehicle";
import { colors, radius, shadow, spacing } from "../theme";

interface VehicleCardProps {
  vehicle: Vehicle;
  onToggleFavorite?: (vehicleId: string, favorited: boolean) => void;
  favorited?: boolean;
}

export function VehicleCard({
  vehicle,
  onToggleFavorite,
  favorited: favoritedProp,
}: VehicleCardProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(Boolean(favoritedProp));
  const brand = getBrandName(vehicle);

  function onFavorite() {
    const next = !favorited;
    setFavorited(next);
    onToggleFavorite?.(vehicle._id, next);
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        shadow.soft,
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/vehicle/${vehicle.slug}`)}
    >
      <View style={styles.media}>
        <VehicleImage uri={vehicle.mainImage} radiusSize={0} />
        <View
          style={[
            styles.badge,
            vehicle.condition === "NEW" && styles.badgeNew,
            vehicle.condition === "CERTIFIED_USED" && styles.badgeVerified,
          ]}
        >
          <Text style={styles.badgeText}>
            {conditionLabel(vehicle.condition)}
          </Text>
        </View>
        <Pressable
          style={styles.heart}
          onPress={(e) => {
            e.stopPropagation?.();
            onFavorite();
          }}
          hitSlop={8}
          accessibilityLabel={favorited ? "Remove favorite" : "Add favorite"}
        >
          <Heart
            size={16}
            color={favorited ? colors.primary : colors.dark}
            fill={favorited ? colors.primary : "transparent"}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.brand}>{brand || "Vehicle"}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {vehicle.year} · {compactMileage(vehicle.mileage)} ·{" "}
          {formatTransmission(vehicle.transmission)}
        </Text>
        <Text style={styles.price}>
          {formatPrice(vehicle.price, vehicle.currency)}
        </Text>
        <Text style={styles.location}>{vehicle.location.city}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.97,
    transform: [{ scale: 0.995 }],
  },
  media: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.dark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeNew: {
    backgroundColor: colors.primary,
  },
  badgeVerified: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  heart: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 14,
  },
  brand: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "600",
    color: colors.dark,
    letterSpacing: -0.2,
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.secondary,
  },
  price: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  location: {
    marginTop: 2,
    fontSize: 12,
    color: colors.secondary,
  },
});
