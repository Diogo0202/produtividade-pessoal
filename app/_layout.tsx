import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { EventDetailSheet } from "@/components/weather/event-detail-sheet";
import { ThemeProvider } from "@/lib/theme-provider";
import { WeatherProvider } from "@/lib/weather-store";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <WeatherProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <EventDetailSheet />
        <StatusBar style="dark" />
      </WeatherProvider>
    </ThemeProvider>
  );
}
