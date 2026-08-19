import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import { EducationProvider } from "@/lib/education-store";
import { createTRPCClient, trpc } from "@/lib/trpc";
import { ThemeProvider } from "@/lib/theme-provider";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createTRPCClient());
  return <trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><ThemeProvider><EducationProvider><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack><StatusBar style="light" /></EducationProvider></ThemeProvider></QueryClientProvider></trpc.Provider>;
}
