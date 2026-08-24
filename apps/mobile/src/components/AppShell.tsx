import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import type { ReactNode } from "react";
import { colors } from "../theme";

export function AppShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== "web" || width < 720) {
    return <View style={styles.fill}>{children}</View>;
  }

  return (
    <View style={styles.desktop}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  desktop: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  phone: {
    width: 430,
    maxWidth: "100%",
    height: "100%",
    maxHeight: 920,
    backgroundColor: colors.background,
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
