import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ProductivityProvider } from "@/lib/productivity-store";
import { ThemeProvider } from "@/lib/theme-provider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ProductivityProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="dark" />
      </ProductivityProvider>
    </ThemeProvider>
  );
}
