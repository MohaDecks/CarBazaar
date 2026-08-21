import { ScrollView, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { Category } from "@car-marketplace/types";
import { CategoryChip } from "./CategoryChip";
import { spacing } from "../theme";

interface CategoryScrollerProps {
  categories: Category[];
  selectedSlug?: string;
}

export function CategoryScroller({
  categories,
  selectedSlug,
}: CategoryScrollerProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        decelerationRate="fast"
      >
        {categories.map((cat) => (
          <CategoryChip
            key={cat._id}
            label={cat.name}
            selected={selectedSlug === cat.slug}
            onPress={() =>
              router.push({
                pathname: "/search",
                params: { category: cat.slug },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -spacing.page,
  },
  content: {
    paddingHorizontal: spacing.page,
    gap: 8,
  },
});
