import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { WEATHER_KNOWLEDGE } from "@/lib/weather-knowledge";
import { useWeather } from "@/lib/weather-store";
import type { WeatherAlertHistoryEntry } from "@/lib/weather-types";
import { formatDateTime } from "@/lib/weather-utils";

function formatRecordedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function AlertHistoryScreen() {
  const { alertHistory, clearAlertHistory, selectEvent } = useWeather();
  const confirmClear = () => Alert.alert("Limpar histórico?", "Os alertas registrados neste aparelho serão removidos.", [{ text: "Cancelar", style: "cancel" }, { text: "Limpar", style: "destructive", onPress: clearAlertHistory }]);

  return <ScreenContainer><FlatList data={alertHistory} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} ListHeaderComponent={<View style={styles.header}><View><Text style={styles.title}>Histórico</Text><Text style={styles.subtitle}>Alertas de alto risco identificados recentemente.</Text></View>{alertHistory.length > 0 && <Pressable onPress={confirmClear} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}><Text style={styles.clearText}>Limpar</Text></Pressable>}</View>} renderItem={({ item }) => <HistoryCard entry={item} onPress={() => selectEvent(item.event)} />} ListEmptyComponent={<View style={styles.empty}><View style={styles.emptyIcon}><IconSymbol name="history" size={28} color="#1677C8" /></View><Text style={styles.emptyTitle}>Nenhum alerta recente</Text><Text style={styles.emptyCopy}>Quando um risco alto for identificado no seu entorno, ele ficará registrado aqui para consulta.</Text></View>} ListFooterComponent={alertHistory.length ? <Text style={styles.footnote}>O histórico é armazenado somente neste aparelho e mantém até 30 alertas recentes.</Text> : null} /> </ScreenContainer>;
}

function HistoryCard({ entry, onPress }: { entry: WeatherAlertHistoryEntry; onPress: () => void }) {
  const knowledge = WEATHER_KNOWLEDGE[entry.event.kind];
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: `${knowledge.color}20` }]}><IconSymbol name={knowledge.icon} size={22} color={knowledge.color} /></View><View style={styles.cardCopy}><View style={styles.cardTop}><Text style={styles.badge}>RISCO ALTO</Text><Text style={styles.recorded}>Registrado em {formatRecordedAt(entry.recordedAt)}</Text></View><Text style={styles.cardTitle}>{entry.event.title}</Text><Text style={styles.cardMeta}>{entry.regionLabel} · Janela {formatDateTime(entry.event.time)}</Text></View><IconSymbol name="chevron.right" size={19} color="#9AABBC" /></Pressable>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 30 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }, title: { color: "#18243A", fontSize: 28, lineHeight: 34, fontWeight: "800" }, subtitle: { color: "#74859A", fontSize: 13, lineHeight: 18, fontWeight: "600", marginTop: 2, maxWidth: 245 }, clearButton: { backgroundColor: "#FFF0F2", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }, clearText: { color: "#C34255", fontSize: 12, lineHeight: 16, fontWeight: "800" }, card: { minHeight: 86, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: "#E7EDF3", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }, cardCopy: { flex: 1, minWidth: 0 }, cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, badge: { color: "#C34255", fontSize: 9, lineHeight: 13, letterSpacing: 0.65, fontWeight: "800" }, recorded: { color: "#8495A7", fontSize: 9, lineHeight: 13, fontWeight: "600" }, cardTitle: { color: "#263D58", fontSize: 14, lineHeight: 19, fontWeight: "800", marginTop: 2 }, cardMeta: { color: "#75889D", fontSize: 10, lineHeight: 14, fontWeight: "600", marginTop: 1 }, empty: { alignItems: "center", paddingHorizontal: 26, paddingTop: 54 }, emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#EAF4FF", alignItems: "center", justifyContent: "center", marginBottom: 15 }, emptyTitle: { color: "#243951", fontSize: 18, lineHeight: 24, fontWeight: "800", textAlign: "center" }, emptyCopy: { color: "#77889B", fontSize: 13, lineHeight: 19, fontWeight: "600", textAlign: "center", marginTop: 5 }, footnote: { color: "#8999A9", fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center", marginTop: 10, paddingHorizontal: 15 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });
