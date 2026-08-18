import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { WeatherMap } from "@/components/weather/weather-map";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useWeather } from "@/lib/weather-store";
import { getConditionIcon, getConditionLabel } from "@/lib/weather-utils";

export default function MapScreen() {
  const { coordinates, snapshot, events, loading, error, locationState, requestLocation, refresh, selectEvent } = useWeather();
  const current = snapshot?.current;

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <View style={styles.page}>
        <WeatherMap coordinates={coordinates} events={events} onEventPress={selectEvent} />
        <View style={styles.topOverlay}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}><IconSymbol name="radar" size={20} color="#FFFFFF" /></View>
            <View><Text style={styles.brandName}>Radar do Tempo</Text><Text style={styles.brandCaption}>PREVISÃO LOCAL</Text></View>
          </View>
          <Pressable onPress={() => void refresh()} style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}><IconSymbol name="refresh" size={20} color="#FFFFFF" /></Pressable>
        </View>
        <View style={styles.statusChip}><View style={styles.statusDot} /><Text style={styles.statusText}>{events.length ? `${events.length} sinais no entorno` : "Sem risco relevante previsto"}</Text></View>
        <View style={styles.summary}>
          <View style={styles.summaryHeader}>
            <View><Text style={styles.location}>{coordinates.label}</Text><Text style={styles.source}>{coordinates.source === "gps" ? "LOCALIZAÇÃO ATUAL" : "LOCALIZAÇÃO DE DEMONSTRAÇÃO"}</Text></View>
            {loading ? <ActivityIndicator color="#1677C8" /> : <IconSymbol name={current ? getConditionIcon(current.weatherCode, current.isDay) : "cloud"} size={36} color="#1677C8" />}
          </View>
          {current ? <View style={styles.weatherLine}><Text style={styles.temperature}>{Math.round(current.temperature)}°</Text><View><Text style={styles.condition}>{getConditionLabel(current.weatherCode)}</Text><Text style={styles.feels}>Sensação de {Math.round(current.apparentTemperature)}° · Vento {Math.round(current.windSpeed)} km/h</Text></View></View> : <Text style={styles.loadingCopy}>Carregando a previsão por coordenadas…</Text>}
          {locationState !== "granted" && <Pressable onPress={() => void requestLocation()} style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}><IconSymbol name="location" size={17} color="#FFFFFF" /><Text style={styles.locationButtonText}>Usar minha localização</Text></Pressable>}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.disclaimer}>Marcadores indicam riscos previstos; toque para entender o fenômeno.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#DDF0FF" },
  topOverlay: { position: "absolute", top: 12, left: 17, right: 17, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(11,27,58,0.92)", paddingVertical: 8, paddingLeft: 8, paddingRight: 12, borderRadius: 17 },
  brandIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: "#1677C8", alignItems: "center", justifyContent: "center" },
  brandName: { color: "#FFFFFF", fontSize: 14, lineHeight: 18, fontWeight: "800" },
  brandCaption: { color: "#A9C5E4", fontSize: 8, lineHeight: 11, letterSpacing: 0.8, fontWeight: "800" },
  refresh: { width: 39, height: 39, borderRadius: 20, backgroundColor: "rgba(11,27,58,0.92)", alignItems: "center", justifyContent: "center" },
  statusChip: { position: "absolute", top: 72, left: 18, backgroundColor: "rgba(255,255,255,0.93)", borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, flexDirection: "row", gap: 6, alignItems: "center" },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#2DA77A" },
  statusText: { color: "#35516D", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  summary: { position: "absolute", left: 14, right: 14, bottom: 13, padding: 17, backgroundColor: "#FFFFFF", borderRadius: 24, shadowColor: "#0B1B3A", shadowOpacity: 0.16, shadowRadius: 14, elevation: 5 },
  summaryHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  location: { color: "#1B2F49", fontSize: 17, lineHeight: 22, fontWeight: "800" },
  source: { color: "#72859B", fontSize: 9, lineHeight: 13, letterSpacing: 0.75, fontWeight: "800", marginTop: 1 },
  weatherLine: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  temperature: { color: "#162B47", fontSize: 44, lineHeight: 49, fontWeight: "800" },
  condition: { color: "#253A55", fontSize: 14, lineHeight: 19, fontWeight: "800" },
  feels: { color: "#71849B", fontSize: 11, lineHeight: 16, fontWeight: "600", marginTop: 1 },
  locationButton: { minHeight: 43, borderRadius: 13, backgroundColor: "#1677C8", marginTop: 13, flexDirection: "row", gap: 7, justifyContent: "center", alignItems: "center" },
  locationButtonText: { color: "#FFFFFF", fontSize: 13, lineHeight: 18, fontWeight: "800" },
  disclaimer: { color: "#7C8FA3", fontSize: 10, lineHeight: 14, fontWeight: "600", marginTop: 11 },
  error: { color: "#C34F5F", fontSize: 11, lineHeight: 16, fontWeight: "600", marginTop: 8 },
  loadingCopy: { color: "#71849B", fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 12 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
