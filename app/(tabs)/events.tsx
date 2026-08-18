import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EventCard } from "@/components/weather/event-card";
import { WeatherFilters } from "@/components/weather/weather-filters";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useWeather } from "@/lib/weather-store";

export default function EventsScreen() {
  const { events, loading, selectEvent, refresh, activeEventKinds } = useWeather();
  const hasFilter = activeEventKinds.length > 0;
  return (
    <ScreenContainer>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<><View style={styles.header}><View><Text style={styles.title}>Eventos</Text><Text style={styles.subtitle}>Selecione os fenômenos que quer acompanhar.</Text></View><Pressable onPress={() => void refresh()} style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}><IconSymbol name="refresh" size={20} color="#1677C8" /></Pressable></View><WeatherFilters /><View style={styles.notice}><IconSymbol name="info" size={18} color="#386EA5" /><Text style={styles.noticeText}>Riscos são estimados por previsão local. Avisos oficiais prevalecem.</Text></View><Text style={styles.listTitle}>{loading ? "ATUALIZANDO SINAIS" : hasFilter ? `${events.length} EVENTOS FILTRADOS` : `${events.length} EVENTOS ESTIMADOS`}</Text></>}
        renderItem={({ item }) => <EventCard event={item} onPress={() => selectEvent(item)} />}
        ListEmptyComponent={loading ? <View style={styles.empty}><ActivityIndicator color="#1677C8" /></View> : <View style={styles.empty}><View style={styles.emptyIcon}><IconSymbol name={hasFilter ? "filter" : "shield"} size={28} color={hasFilter ? "#1677C8" : "#2DA77A"} /></View><Text style={styles.emptyTitle}>{hasFilter ? "Nenhum evento deste tipo" : "Cenário tranquilo por enquanto"}</Text><Text style={styles.emptyCopy}>{hasFilter ? "Ajuste os filtros para ver outros fenômenos previstos no entorno." : "Não encontramos sinais de risco pelos critérios desta previsão nas próximas 48 horas."}</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 28 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }, title: { color: "#18243A", fontSize: 28, lineHeight: 34, fontWeight: "800" }, subtitle: { color: "#74859A", fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 2 }, refresh: { width: 39, height: 39, borderRadius: 14, backgroundColor: "#EAF4FF", alignItems: "center", justifyContent: "center" }, notice: { backgroundColor: "#EAF4FF", borderRadius: 16, padding: 13, flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 15 }, noticeText: { color: "#386EA5", fontSize: 12, lineHeight: 17, fontWeight: "600", flex: 1 }, listTitle: { color: "#71849B", fontSize: 10, lineHeight: 14, letterSpacing: 0.8, fontWeight: "800", marginTop: 22, marginBottom: 10 }, empty: { alignItems: "center", paddingHorizontal: 30, paddingTop: 38 }, emptyIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#EAF4FF", alignItems: "center", justifyContent: "center", marginBottom: 15 }, emptyTitle: { color: "#243951", fontSize: 18, lineHeight: 24, fontWeight: "800", textAlign: "center" }, emptyCopy: { color: "#77889B", fontSize: 13, lineHeight: 19, fontWeight: "600", textAlign: "center", marginTop: 5 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });
