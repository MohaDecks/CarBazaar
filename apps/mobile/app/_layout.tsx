import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppShell } from "../src/components/AppShell";
import { InstallBanner } from "../src/components/InstallBanner";
import { registerServiceWorker } from "../src/pwa";
import { colors } from "../src/theme";

export default function RootLayout() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <AppShell>
      <StatusBar style="dark" />
      <InstallBanner />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.dark,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="vehicle/[...slug]"
          options={{ title: "Vehicle" }}
        />
      </Stack>
    </AppShell>
  );
}
