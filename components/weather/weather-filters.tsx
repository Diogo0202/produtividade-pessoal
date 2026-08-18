import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { WEATHER_KNOWLEDGE } from "@/lib/weather-knowledge";
import { useWeather } from "@/lib/weather-store";
import type { WeatherEventKind } from "@/lib/weather-types";

const FILTERS: Array<{ kind: WeatherEventKind; label: string }> = [
  { kind: "trovoada", label: "Tempestade" },
  { kind: "chuva", label: "Chuva" },
  { kind: "vento", label: "Vento" },
  { kind: "calor", label: "Calor" },
  { kind: "visibilidade", label: "Visibilidade" },
];

export function WeatherFilters({ compact = false }: { compact?: boolean }) {
  const { activeEventKinds, toggleEventKind, clearEventKinds } = useWeather();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, compact && styles.compactRow]}>
      <Pressable onPress={clearEventKinds} style={({ pressed }) => [styles.chip, activeEventKinds.length === 0 && styles.chipAllActive, pressed && styles.pressed]}>
        <IconSymbol name="filter" size={14} color={activeEventKinds.length === 0 ? "#FFFFFF" : "#4F6983"} />
        <Text style={[styles.chipText, activeEventKinds.length === 0 && styles.chipTextActive]}>Todos</Text>
      </Pressable>
      {FILTERS.map(({ kind, label }) => {
        const active = activeEventKinds.includes(kind);
        const knowledge = WEATHER_KNOWLEDGE[kind];
        return <Pressable key={kind} onPress={() => toggleEventKind(kind)} style={({ pressed }) => [styles.chip, active && { backgroundColor: knowledge.color, borderColor: knowledge.color }, pressed && styles.pressed]}><IconSymbol name={knowledge.icon} size={14} color={active ? "#FFFFFF" : knowledge.color} /><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ row: { gap: 8, paddingVertical: 2, paddingRight: 20 }, compactRow: { paddingVertical: 0 }, chip: { flexDirection: "row", alignItems: "center", gap: 5, minHeight: 34, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9E4EF", borderRadius: 17, paddingHorizontal: 11 }, chipAllActive: { backgroundColor: "#1677C8", borderColor: "#1677C8" }, chipText: { color: "#4F6983", fontSize: 11, lineHeight: 15, fontWeight: "800" }, chipTextActive: { color: "#FFFFFF" }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });
