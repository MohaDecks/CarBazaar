import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import type { Brand } from "@car-marketplace/types";
import { colors, radius, shadow, spacing } from "../theme";

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        shadow.soft,
        pressed && styles.pressed,
      ]}
      onPress={() =>
        router.push({ pathname: "/search", params: { brand: brand.slug } })
      }
    >
      <View style={styles.logo}>
        <Text style={styles.logoText}>{brand.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {brand.name}
      </Text>
    </Pressable>
  );
}

interface BrandScrollerProps {
  brands: Brand[];
}

export function BrandScroller({ brands }: BrandScrollerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
    >
      {brands.map((b) => (
        <BrandCard key={b._id} brand={b} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingRight: spacing.page,
  },
  card: {
    width: 88,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  name: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.dark,
    textAlign: "center",
  },
});
