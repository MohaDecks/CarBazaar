import { Pressable, Text, StyleSheet } from "react-native";
import { colors, radius } from "../theme";

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.dark,
  },
  labelSelected: {
    color: colors.white,
  },
});
