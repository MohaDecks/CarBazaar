import { View, Text, Pressable, StyleSheet } from "react-native";
import { Bell, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";
import { useAuthStore } from "../store";

interface DriveETHeaderProps {
  showHero?: boolean;
}

export function DriveETHeader({ showHero = true }: DriveETHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.topRow}>
        <Text style={styles.logo}>
          Drive<Text style={styles.logoAccent}>ET</Text>
        </Text>
        <View style={styles.actions}>
          <Pressable
            style={styles.iconBtn}
            hitSlop={8}
            accessibilityLabel="Notifications"
          >
            <Bell size={20} color={colors.dark} strokeWidth={1.75} />
          </Pressable>
          <Pressable
            style={styles.avatar}
            hitSlop={8}
            onPress={() => router.push("/profile")}
            accessibilityLabel="Profile"
          >
            {user ? (
              <Text style={styles.avatarText}>
                {user.firstName.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <User size={16} color={colors.white} strokeWidth={2} />
            )}
          </Pressable>
        </View>
      </View>

      {showHero && (
        <Text style={styles.hero}>
          Find your{"\n"}
          next perfect <Text style={styles.heroAccent}>car</Text>.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.page,
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.dark,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: colors.primary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  hero: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.dark,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  heroAccent: {
    color: colors.primary,
  },
});
