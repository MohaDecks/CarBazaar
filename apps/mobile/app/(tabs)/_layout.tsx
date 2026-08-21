import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import {
  Home,
  Compass,
  Heart,
  MessageCircle,
  User,
} from "lucide-react-native";
import { colors, shadow } from "../../src/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.item,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={22}
              color={color}
              strokeWidth={focused ? 2.25 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <Compass
              size={22}
              color={color}
              strokeWidth={focused ? 2.25 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <Heart
              size={22}
              color={color}
              strokeWidth={focused ? 2.25 : 1.75}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle
              size={22}
              color={color}
              strokeWidth={focused ? 2.25 : 1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User
              size={22}
              color={color}
              strokeWidth={focused ? 2.25 : 1.75}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    ...shadow.nav,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  item: {
    paddingTop: 2,
  },
});
