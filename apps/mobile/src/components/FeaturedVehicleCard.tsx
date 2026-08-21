import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { formatPrice } from "@car-marketplace/utils";
import type { Vehicle } from "@car-marketplace/types";
import { VehicleImage } from "./VehicleImage";
import { getBrandName, compactMileage } from "../lib/vehicle";
import { colors, radius, shadow, spacing } from "../theme";

interface FeaturedVehicleCardProps {
  vehicle: Vehicle;
}

export function FeaturedVehicleCard({ vehicle }: FeaturedVehicleCardProps) {
  const router = useRouter();
  const brand = getBrandName(vehicle);

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
        <VehicleImage uri={vehicle.mainImage} radiusSize={radius.xl} />
        <LinearGradient
          colors={["transparent", "rgba(17,17,17,0.78)"]}
          locations={[0.35, 1]}
          style={styles.gradient}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {vehicle.featured ? "FEATURED" : "VERIFIED"}
          </Text>
        </View>
        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={1}>
            {brand} {vehicle.title}
          </Text>
          <Text style={styles.meta}>
            {vehicle.year} · {compactMileage(vehicle.mileage)}
          </Text>
          <View style={styles.bottom}>
            <Text style={styles.price}>
              {formatPrice(vehicle.price, vehicle.currency)}
            </Text>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>View Details</Text>
              <ArrowRight size={14} color={colors.white} strokeWidth={2} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.dark,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },
  media: {
    position: "relative",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  meta: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
  },
  bottom: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ctaText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
});
