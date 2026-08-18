import { Marker } from "react-native-maps";
import { StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { WEATHER_KNOWLEDGE } from "@/lib/weather-knowledge";
import type { WeatherEvent } from "@/lib/weather-types";

export function WeatherMarker({ event, onPress }: { event: WeatherEvent; onPress: () => void }) {
  const knowledge = WEATHER_KNOWLEDGE[event.kind];
  return (
    <Marker coordinate={{ latitude: event.latitude, longitude: event.longitude }} onPress={onPress} anchor={{ x: 0.5, y: 0.9 }}>
      <View style={[styles.marker, { borderColor: knowledge.color }]}>
        <IconSymbol name={knowledge.icon} size={17} color={knowledge.color} />
        <View style={[styles.level, { backgroundColor: event.level === "alto" ? "#D95363" : "#E48B2C" }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({ marker: { width: 39, height: 39, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 2, alignItems: "center", justifyContent: "center", shadowColor: "#18243A", shadowOpacity: 0.18, shadowRadius: 6, elevation: 3 }, level: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: "#FFFFFF", position: "absolute", right: -2, top: -2 } });
