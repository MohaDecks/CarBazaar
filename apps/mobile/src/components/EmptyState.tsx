import { View, Text, Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Car } from "lucide-react-native";
import { colors, radius, spacing } from "../theme";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Car,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon size={24} color={colors.secondary} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.dark,
    textAlign: "center",
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  btnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
