import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { WEATHER_KNOWLEDGE } from "@/lib/weather-knowledge";
import type { WeatherEvent } from "@/lib/weather-types";
import { formatDateTime } from "@/lib/weather-utils";

export function EventCard({ event, onPress }: { event: WeatherEvent; onPress: () => void }) {
  const knowledge = WEATHER_KNOWLEDGE[event.kind];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: `${knowledge.color}18` }]}><IconSymbol name={knowledge.icon} size={22} color={knowledge.color} /></View>
      <View style={styles.copy}><View style={styles.titleRow}><Text style={styles.title} numberOfLines={2}>{event.title}</Text><View style={[styles.level, { backgroundColor: event.level === "alto" ? "#FCE8EB" : "#FFF2DF" }]}><Text style={[styles.levelText, { color: event.level === "alto" ? "#C94455" : "#B76A1B" }]}>{event.level === "alto" ? "ALTO" : "MODERADO"}</Text></View></View><Text style={styles.time}>{formatDateTime(event.time)}</Text><Text style={styles.description} numberOfLines={2}>{event.shortDescription}</Text></View><IconSymbol name="chevron.right" size={20} color="#93A1B2" />
    </Pressable>
  );
}

const styles = StyleSheet.create({ card: { backgroundColor: "#FFFFFF", borderRadius: 19, borderWidth: 1, borderColor: "#E8EDF3", padding: 14, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10 }, iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }, copy: { flex: 1, minWidth: 0 }, titleRow: { flexDirection: "row", alignItems: "center", gap: 8 }, title: { color: "#18243A", flex: 1, fontSize: 14, lineHeight: 19, fontWeight: "800" }, level: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 }, levelText: { fontSize: 8, lineHeight: 11, letterSpacing: 0.5, fontWeight: "800" }, time: { color: "#1677C8", fontSize: 11, lineHeight: 15, fontWeight: "800", marginTop: 3 }, description: { color: "#77879A", fontSize: 11, lineHeight: 15, fontWeight: "600", marginTop: 1 }, pressed: { opacity: 0.7, transform: [{ scale: 0.985 }] } });
