import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  formatCondition,
  formatFuel,
  formatMileage,
  formatPrice,
  formatTransmission,
} from "@car-marketplace/utils";
import { api } from "../../src/api";
import { VehicleImage } from "../../src/components/VehicleImage";
import { Vehicle360Viewer } from "../../src/components/Vehicle360Viewer";
import { colors, radius, spacing } from "../../src/theme";
import type { Vehicle } from "@car-marketplace/types";
import { getBrandName } from "../../src/lib/vehicle";

type MediaMode = "photo" | "360";

export default function VehicleDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();
  const slugPath = Array.isArray(slug) ? slug.join("/") : slug;
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
      <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Vehicle not found</Text>
      </View>
    );
  }

  const brand = getBrandName(vehicle);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.mediaPad}>
        {mode === "photo" ? (
          <View style={styles.photoWrap}>
            <VehicleImage uri={vehicle.mainImage} radiusSize={radius.lg} />
          </View>
        ) : (
          <Vehicle360Viewer vehicle={vehicle} />
        )}

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, mode === "photo" && styles.tabActive]}
            onPress={() => setMode("photo")}
          >
            <Text
              style={[styles.tabText, mode === "photo" && styles.tabTextActive]}
            >
              Front
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              mode === "360" && styles.tabActive,
              !can360 && styles.tabDisabled,
            ]}
            onPress={() => can360 && setMode("360")}
            disabled={!can360}
          >
            <Text
              style={[
                styles.tabText,
                mode === "360" && styles.tabTextActive,
                !can360 && styles.tabTextDisabled,
              ]}
            >
              360° View
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.condition}>
        {formatCondition(vehicle.condition)}
      </Text>
      <Text style={styles.title}>
        {brand} {vehicle.title}
      </Text>
      <Text style={styles.year}>{vehicle.year}</Text>
      <Text style={styles.price}>
        {formatPrice(vehicle.price, vehicle.currency)}
      </Text>
      <Text style={styles.location}>
        {vehicle.location.city}, Ethiopia
      </Text>

      <View style={styles.specs}>
        {[
          ["Mileage", formatMileage(vehicle.mileage)],
          ["Fuel", formatFuel(vehicle.fuel)],
          ["Transmission", formatTransmission(vehicle.transmission)],
          ["Engine", vehicle.engine],
          ["Color", vehicle.color],
        ]
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <View key={label as string} style={styles.specRow}>
              <Text style={styles.specLabel}>{label}</Text>
              <Text style={styles.specValue}>{value}</Text>
            </View>
          ))}
      </View>

      <Text style={styles.section}>Description</Text>
      <Text style={styles.description}>{vehicle.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: colors.secondary },
  mediaPad: {
    paddingHorizontal: spacing.page,
    paddingTop: spacing.sm,
  },
  photoWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.dark,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabTextDisabled: {
    color: colors.secondary,
  },
  condition: {
    marginTop: spacing.md,
    marginHorizontal: spacing.page,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
  },
  title: {
    marginHorizontal: spacing.page,
    marginTop: 4,
    fontSize: 24,
    fontWeight: "800",
    color: colors.dark,
  },
  year: {
    marginHorizontal: spacing.page,
    color: colors.secondary,
    fontSize: 14,
  },
  price: {
    marginHorizontal: spacing.page,
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  location: {
    marginHorizontal: spacing.page,
    marginTop: 4,
    color: colors.secondary,
    fontSize: 13,
  },
  specs: {
    margin: spacing.page,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specLabel: {
    fontSize: 12,
    color: colors.secondary,
    textTransform: "uppercase",
  },
  specValue: { fontSize: 14, fontWeight: "600", color: colors.dark },
  section: {
    marginHorizontal: spacing.page,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.dark,
  },
  description: {
    marginHorizontal: spacing.page,
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray600,
  },
});
