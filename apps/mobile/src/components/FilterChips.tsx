import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing } from "../theme";

const FILTERS = [
  { label: "Brand", params: {} },
  { label: "Price", params: { sort: "price_asc" } },
  { label: "Year", params: { sort: "newest" } },
  { label: "More Filters", params: {} },
] as const;

export function FilterChips() {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FILTERS.map((f) => (
        <Pressable
          key={f.label}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          onPress={() =>
            router.push({ pathname: "/search", params: f.params })
          }
        >
          <Text style={styles.label}>{f.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingRight: spacing.page,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.dark,
  },
});
