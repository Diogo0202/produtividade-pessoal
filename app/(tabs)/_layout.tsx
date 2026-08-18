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
        tabBarActiveTintColor: "#1677C8",
        tabBarInactiveTintColor: "#71849B",
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
        tabBarStyle: { height: 58 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding, backgroundColor: "#FFFFFF", borderTopWidth: 0.5, borderTopColor: "#DDE6EF" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Mapa", tabBarIcon: ({ color }) => <IconSymbol name="map" size={24} color={color} /> }} />
      <Tabs.Screen name="now" options={{ title: "Agora", tabBarIcon: ({ color }) => <IconSymbol name="cloud" size={24} color={color} /> }} />
      <Tabs.Screen name="events" options={{ title: "Eventos", tabBarIcon: ({ color }) => <IconSymbol name="warnings" size={24} color={color} /> }} />
      <Tabs.Screen name="about" options={{ title: "Dados", tabBarIcon: ({ color }) => <IconSymbol name="data" size={24} color={color} /> }} />
    </Tabs>
  );
}
