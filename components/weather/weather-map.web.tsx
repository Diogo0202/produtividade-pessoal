import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { WEATHER_KNOWLEDGE } from "@/lib/weather-knowledge";
import type { Coordinates, WeatherEvent } from "@/lib/weather-types";

export function WeatherMap({ coordinates, events, onEventPress }: { coordinates: Coordinates; events: WeatherEvent[]; onEventPress: (event: WeatherEvent) => void }) {
  return (
    <View style={styles.map}>
      <View style={styles.contourOne} /><View style={styles.contourTwo} /><View style={styles.contourThree} />
      <View style={styles.grid}>{Array.from({ length: 12 }, (_, index) => <View key={index} style={[styles.gridLine, index % 2 ? styles.gridLineVertical : styles.gridLineHorizontal]} />)}</View>
      <View style={styles.userDot}><View style={styles.userDotInner} /></View>
      {events.slice(0, 5).map((event, index) => {
        const knowledge = WEATHER_KNOWLEDGE[event.kind];
        const positions: Array<{ top: `${number}%`; left: `${number}%` }> = [{ top: "24%", left: "22%" }, { top: "61%", left: "66%" }, { top: "36%", left: "72%" }, { top: "68%", left: "28%" }, { top: "15%", left: "56%" }];
        return <Pressable key={event.id} onPress={() => onEventPress(event)} style={({ pressed }) => [styles.eventMarker, positions[index], { borderColor: knowledge.color }, pressed && styles.pressed]}><IconSymbol name={knowledge.icon} size={18} color={knowledge.color} /><View style={[styles.levelDot, { backgroundColor: event.level === "alto" ? "#D95363" : "#E48B2C" }]} /></Pressable>;
      })}
      <View style={styles.mapFooter}><IconSymbol name="location" size={14} color="#1677C8" /><Text style={styles.mapFooterText}>{coordinates.label}</Text><Text style={styles.coordinateText}>{coordinates.latitude.toFixed(2)}, {coordinates.longitude.toFixed(2)}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: "#DDF0FF", overflow: "hidden" },
  contourOne: { position: "absolute", width: 330, height: 330, borderRadius: 180, backgroundColor: "#C6E5FE", top: -110, left: -85 },
  contourTwo: { position: "absolute", width: 280, height: 280, borderRadius: 150, backgroundColor: "#B6DBF4", bottom: -120, right: -75 },
  contourThree: { position: "absolute", width: 150, height: 150, borderRadius: 90, borderWidth: 28, borderColor: "#CFE9FB", top: "31%", left: "36%" },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.42 },
  gridLine: { position: "absolute", backgroundColor: "#9BC5E6" },
  gridLineVertical: { width: 1, height: "100%", left: "50%" },
  gridLineHorizontal: { height: 1, width: "100%", top: "50%" },
  userDot: { position: "absolute", top: "48%", left: "47%", width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(22,119,200,0.2)", alignItems: "center", justifyContent: "center" },
  userDotInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#1677C8", borderWidth: 3, borderColor: "#FFFFFF" },
  eventMarker: { position: "absolute", width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", borderWidth: 2, alignItems: "center", justifyContent: "center", shadowColor: "#17375C", shadowOpacity: 0.17, shadowRadius: 7, elevation: 3 },
  levelDot: { position: "absolute", width: 10, height: 10, borderRadius: 5, borderColor: "#FFFFFF", borderWidth: 2, right: -2, top: -2 },
  mapFooter: { position: "absolute", left: 16, right: 16, bottom: 16, minHeight: 34, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.88)", flexDirection: "row", alignItems: "center", paddingHorizontal: 10, gap: 5 },
  mapFooterText: { color: "#23405E", fontSize: 12, lineHeight: 16, fontWeight: "800", flex: 1 },
  coordinateText: { color: "#71849B", fontSize: 10, lineHeight: 14, fontWeight: "600" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.96 }] },
});
