import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../../src/api";
import { VehicleCard } from "../../src/components/VehicleCard";
import { VehicleCardSkeleton } from "../../src/components/Skeletons";
import { EmptyState } from "../../src/components/EmptyState";
import { SearchBar } from "../../src/components/SearchBar";
import { colors, spacing } from "../../src/theme";
import type { Vehicle } from "@car-marketplace/types";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
  }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(params.sort || "newest");
  const [q, setQ] = useState(params.q || "");

  useEffect(() => {
    if (params.q !== undefined) setQ(params.q || "");
    if (params.sort) setSort(params.sort);
  }, [params.q, params.sort]);

  useEffect(() => {
    setLoading(true);
    api
      .getVehicles({
        q: q || params.q,
        category: params.category,
        brand: params.brand,
        sort,
        limit: 20,
      })
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [q, params.q, params.category, params.brand, sort]);

  const sorts = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price ↑" },
    { value: "price_desc", label: "Price ↓" },
  ];

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <SearchBar value={q} onChangeText={setQ} />
        <View style={styles.sortRow}>
          {sorts.map((s) => (
            <Pressable
              key={s.value}
              onPress={() => setSort(s.value)}
              style={[styles.chip, sort === s.value && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  sort === s.value && styles.chipTextActive,
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.listPad}>
          <VehicleCardSkeleton />
          <VehicleCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
          ListEmptyComponent={
            <EmptyState
              title="No cars found"
              description="Try changing your search or filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setQ("");
                setSort("newest");
                router.replace("/search");
              }}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.page,
    paddingBottom: spacing.md,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.5,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.dark,
  },
  chipTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.page,
    paddingBottom: 28,
  },
  listPad: {
    paddingHorizontal: spacing.page,
  },
});
