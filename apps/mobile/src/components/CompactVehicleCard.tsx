import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { Vehicle } from "@car-marketplace/types";
import { VehicleImage } from "./VehicleImage";
import { getBrandName, compactPrice } from "../lib/vehicle";
import { colors, radius, shadow } from "../theme";

interface CompactVehicleCardProps {
  vehicle: Vehicle;
}

export function CompactVehicleCard({ vehicle }: CompactVehicleCardProps) {
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
      <VehicleImage uri={vehicle.mainImage} radiusSize={0} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {brand} {vehicle.title}
        </Text>
        <Text style={styles.year}>{vehicle.year}</Text>
        <Text style={styles.price}>
          {compactPrice(vehicle.price, vehicle.currency)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginRight: 12,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
  body: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.dark,
  },
  year: {
    marginTop: 2,
    fontSize: 12,
    color: colors.secondary,
  },
  price: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
});
