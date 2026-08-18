import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B5BDB",
        tabBarInactiveTintColor: "#8B94A5",
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
        tabBarStyle: { height: 58 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding, backgroundColor: "#FFFFFF", borderTopWidth: 0.5, borderTopColor: "#E4E7EF" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Hoje", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={24} color={color} /> }} />
      <Tabs.Screen name="tasks" options={{ title: "Tarefas", tabBarIcon: ({ color }) => <IconSymbol name="checklist" size={24} color={color} /> }} />
      <Tabs.Screen name="plan" options={{ title: "Planejar", tabBarIcon: ({ color }) => <IconSymbol name="calendar" size={24} color={color} /> }} />
      <Tabs.Screen name="goals" options={{ title: "Metas", tabBarIcon: ({ color }) => <IconSymbol name="target" size={24} color={color} /> }} />
    </Tabs>
  );
}
