import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import { colors, spacing } from "../theme";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  href?: Href;
  params?: Record<string, string>;
}

export function SectionHeader({
  title,
  actionLabel = "See all",
  href,
  params,
}: SectionHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {href ? (
        <Pressable
          onPress={() => {
            if (params && typeof href === "string") {
              router.push({ pathname: href as "/search", params });
            } else {
              router.push(href);
            }
          }}
          hitSlop={8}
        >
          <Text style={styles.action}>{actionLabel} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.3,
  },
  action: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
});
