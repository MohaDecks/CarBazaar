import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { api } from "../../src/api";
import { DriveETHeader } from "../../src/components/DriveETHeader";
import { SearchBar } from "../../src/components/SearchBar";
import { FilterChips } from "../../src/components/FilterChips";
import { CategoryScroller } from "../../src/components/CategoryScroller";
import { SectionHeader } from "../../src/components/SectionHeader";
import { FeaturedVehicleCard } from "../../src/components/FeaturedVehicleCard";
import { VehicleCard } from "../../src/components/VehicleCard";
import { CompactVehicleCard } from "../../src/components/CompactVehicleCard";
import { BrandScroller } from "../../src/components/BrandCard";
import { EmptyState } from "../../src/components/EmptyState";
import { HomeSkeletons } from "../../src/components/Skeletons";
import { colors, spacing } from "../../src/theme";
import type { Brand, Category, Vehicle } from "@car-marketplace/types";

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Vehicle[]>([]);
  const [newest, setNewest] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    Promise.all([
      api.getVehicles({ featured: true, limit: 4 }),
      api.getVehicles({ sort: "newest", limit: 8 }),
      api.getCategories(),
      api.getBrands(),
    ])
      .then(([f, n, c, b]) => {
        setFeatured(f.data);
        setNewest(n.data);
        setCategories(c.data);
        setBrands(b.data.slice(0, 8));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const heroVehicle = featured[0];
  const featuredList = featured.slice(heroVehicle ? 1 : 0);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DriveETHeader />

        <View style={styles.searchBlock}>
          <SearchBar value={q} onChangeText={setQ} />
          <View style={styles.filterGap}>
            <FilterChips />
          </View>
        </View>

        {loading ? (
          <HomeSkeletons />
        ) : (
          <>
            {categories.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Categories" href="/search" />
                <CategoryScroller categories={categories} />
              </View>
            )}

            {heroVehicle && (
              <View style={styles.section}>
                <SectionHeader
                  title="Featured Cars"
                  href="/search"
                  params={{ sort: "featured" }}
                />
                <FeaturedVehicleCard vehicle={heroVehicle} />
                {featuredList.length > 0 && (
                  <View style={styles.featuredList}>
                    {featuredList.map((v) => (
                      <VehicleCard key={v._id} vehicle={v} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {!heroVehicle && featured.length === 0 && newest.length === 0 ? (
              <EmptyState
                title="No cars found"
                description="Try changing your search or filters."
                actionLabel="Clear Filters"
                onAction={() => setQ("")}
              />
            ) : null}

            {newest.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="New Arrivals"
                  href="/search"
                  params={{ sort: "newest" }}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontal}
                  decelerationRate="fast"
                >
                  {newest.map((v) => (
                    <CompactVehicleCard key={v._id} vehicle={v} />
                  ))}
                </ScrollView>
              </View>
            )}

            {brands.length > 0 && (
              <View style={[styles.section, styles.lastSection]}>
                <SectionHeader title="Popular Brands" href="/search" />
                <BrandScroller brands={brands} />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  searchBlock: {
    paddingHorizontal: spacing.page,
    marginBottom: spacing.section,
  },
  filterGap: {
    marginTop: 12,
  },
  section: {
    paddingHorizontal: spacing.page,
    marginBottom: spacing.section,
  },
  lastSection: {
    marginBottom: 8,
  },
  featuredList: {
    marginTop: spacing.md,
  },
  horizontal: {
    paddingRight: spacing.page,
  },
});
