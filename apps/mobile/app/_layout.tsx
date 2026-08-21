import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
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
    </>
  );
}
