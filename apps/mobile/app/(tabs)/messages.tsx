import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle } from "lucide-react-native";
import { EmptyState } from "../../src/components/EmptyState";
import { colors, spacing } from "../../src/theme";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      <Text style={styles.title}>Messages</Text>
      <EmptyState
        icon={MessageCircle}
        title="No messages yet"
        description="Conversations with sellers and dealers will appear here."
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
