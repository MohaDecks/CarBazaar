import { View, ScrollView, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme";

function Block({ style }: { style?: object }) {
  return <View style={[styles.block, style]} />;
}

export function CategorySkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Block key={i} style={styles.chip} />
      ))}
    </ScrollView>
  );
}

export function FeaturedVehicleSkeleton() {
  return (
    <View style={styles.featured}>
      <Block style={styles.featuredImage} />
    </View>
  );
}

export function VehicleCardSkeleton() {
  return (
    <View style={styles.card}>
      <Block style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Block style={{ width: 60, height: 10, marginBottom: 8 }} />
        <Block style={{ width: "70%", height: 16, marginBottom: 8 }} />
        <Block style={{ width: "50%", height: 12, marginBottom: 12 }} />
        <Block style={{ width: 110, height: 16 }} />
      </View>
    </View>
  );
}

export function BrandSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Block key={i} style={styles.brand} />
      ))}
    </ScrollView>
  );
}

export function HomeSkeletons() {
  return (
    <View>
      <CategorySkeleton />
      <View style={{ height: spacing.section }} />
      <FeaturedVehicleSkeleton />
      <View style={{ height: spacing.lg }} />
      <VehicleCardSkeleton />
      <VehicleCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.muted,
    borderRadius: radius.sm,
  },
  row: {
    gap: 8,
  },
  chip: {
    width: 72,
    height: 36,
    borderRadius: radius.full,
  },
  featured: {
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: radius.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  cardImage: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: 0,
  },
  cardBody: {
    padding: 14,
  },
  brand: {
    width: 88,
    height: 96,
    borderRadius: radius.md,
  },
});
