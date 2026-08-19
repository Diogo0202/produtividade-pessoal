import { Tabs } from "expo-router";

export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}><Tabs.Screen name="index" options={{ title: "Radar do Tempo Educação" }} /><Tabs.Screen name="now" options={{ href: null }} /><Tabs.Screen name="events" options={{ href: null }} /><Tabs.Screen name="history" options={{ href: null }} /><Tabs.Screen name="about" options={{ href: null }} /><Tabs.Screen name="plan" options={{ href: null }} /><Tabs.Screen name="goals" options={{ href: null }} /><Tabs.Screen name="tasks" options={{ href: null }} /></Tabs>;
}
