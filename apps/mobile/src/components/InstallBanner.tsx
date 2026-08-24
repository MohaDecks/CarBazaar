import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { isStandalonePwa } from "../pwa";
import { colors, radius } from "../theme";

export function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (isStandalonePwa()) return;
    const dismissed = window.sessionStorage.getItem("driveet-install-dismissed");
    if (dismissed) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.text}>Install DriveET on your phone for the full app.</Text>
      <Pressable
        onPress={() => {
          window.sessionStorage.setItem("driveet-install-dismissed", "1");
          setVisible(false);
        }}
        hitSlop={8}
      >
        <Text style={styles.close}>OK</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: colors.dark,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  close: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: colors.white,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
