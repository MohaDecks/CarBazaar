import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart } from "lucide-react-native";
import { EmptyState } from "../../src/components/EmptyState";
import { colors, spacing } from "../../src/theme";
import { useRouter } from "expo-router";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      <Text style={styles.title}>Favorites</Text>
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        description="Save vehicles from search or detail screens to find them here."
        actionLabel="Explore cars"
        onAction={() => router.push("/search")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.page,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
});
