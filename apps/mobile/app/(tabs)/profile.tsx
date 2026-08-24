import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../../src/api";
import { useAuthStore } from "../../src/store";
import { colors, radius, spacing } from "../../src/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, accessToken, setAuth, logout } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onLogin() {
    setError("");
    try {
      const res = (await api.login(email, password)) as {
        data: {
          user: Parameters<typeof setAuth>[0];
          tokens: { accessToken: string };
        };
      };
      setAuth(res.data.user, res.data.tokens.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  if (accessToken && user) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.meta}>{user.email}</Text>
          <Text style={styles.role}>{user.role}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.btnOutline, pressed && { opacity: 0.85 }]}
          onPress={logout}
        >
          <Text style={styles.btnOutlineText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>
        Access favorites, messages, and your seller tools.
      </Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor={colors.gray400}
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={colors.gray400}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
        onPress={onLogin}
      >
        <Text style={styles.btnText}>Sign in</Text>
      </Pressable>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.dark,
  },
  meta: {
    marginTop: 4,
    color: colors.secondary,
    fontSize: 14,
  },
  role: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    height: 48,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 15,
    color: colors.dark,
  },
  btn: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  btnOutline: {
    marginTop: 24,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlineText: {
    color: colors.dark,
    fontWeight: "600",
    fontSize: 15,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
  },
});
