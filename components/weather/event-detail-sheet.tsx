import { Linking } from "react-native";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { WEATHER_KNOWLEDGE } from "@/lib/weather-knowledge";
import { useWeather } from "@/lib/weather-store";
import { formatDateTime } from "@/lib/weather-utils";

export function EventDetailSheet() {
  const { selectedEvent, selectEvent } = useWeather();
  if (!selectedEvent) return null;
  const knowledge = WEATHER_KNOWLEDGE[selectedEvent.kind];
  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => selectEvent(null)}>
      <View style={styles.overlay}><Pressable style={styles.backdrop} onPress={() => selectEvent(null)} /><View style={styles.sheet}><View style={styles.grabber} /><View style={styles.header}><View style={[styles.icon, { backgroundColor: `${knowledge.color}1D` }]}><IconSymbol name={knowledge.icon} size={24} color={knowledge.color} /></View><View style={styles.headerCopy}><Text style={styles.eyebrow}>RISCO PREVISTO · {selectedEvent.level.toUpperCase()}</Text><Text style={styles.title}>{selectedEvent.title}</Text><Text style={styles.time}>{formatDateTime(selectedEvent.time)}</Text></View><Pressable onPress={() => selectEvent(null)} style={({ pressed }) => [styles.close, pressed && styles.pressed]}><Text style={styles.closeText}>×</Text></Pressable></View>
        <ScrollView showsVerticalScrollIndicator={false}><View style={styles.notice}><IconSymbol name="info" size={17} color="#3169A7" /><Text style={styles.noticeText}>Este item é uma classificação baseada em previsão por coordenadas; não substitui um aviso oficial.</Text></View><Text style={styles.sectionTitle}>O que a previsão está sinalizando</Text><View style={styles.metricGrid}>{selectedEvent.metrics.map((metric) => <View key={metric.label} style={styles.metric}><Text style={styles.metricValue}>{metric.value}</Text><Text style={styles.metricLabel}>{metric.label}</Text></View>)}</View><Text style={styles.sectionTitle}>Como esse fenômeno se forma</Text><Text style={styles.body}>{knowledge.formation}</Text><Text style={styles.sectionTitle}>Como reduzir impactos</Text>{knowledge.mitigation.map((item) => <View key={item} style={styles.bullet}><View style={[styles.bulletDot, { backgroundColor: knowledge.color }]} /><Text style={styles.body}>{item}</Text></View>)}<Text style={styles.sectionTitle}>Quando costuma ser mais comum</Text><Text style={styles.body}>{knowledge.season}</Text><View style={styles.official}><Text style={styles.officialTitle}>Avisos oficiais</Text><Text style={styles.officialCopy}>{knowledge.officialNote}</Text><Pressable onPress={() => void Linking.openURL("https://avisos.inmet.gov.br/")} style={({ pressed }) => [styles.officialButton, pressed && styles.pressed]}><Text style={styles.officialButtonText}>Abrir avisos do INMET</Text><IconSymbol name="arrow.up.right" size={16} color="#FFFFFF" /></Pressable></View><View style={{ height: 28 }} /></ScrollView>
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(7,20,43,0.42)" },
  sheet: { maxHeight: "88%", backgroundColor: "#FFFFFF", borderTopLeftRadius: 29, borderTopRightRadius: 29, paddingHorizontal: 20, paddingTop: 10 },
  grabber: { width: 38, height: 5, borderRadius: 4, backgroundColor: "#D6DEE8", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 11, marginBottom: 17 },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1 },
  eyebrow: { color: "#667C96", fontSize: 9, lineHeight: 13, letterSpacing: 0.8, fontWeight: "800" },
  title: { color: "#18243A", fontSize: 20, lineHeight: 26, fontWeight: "800", marginTop: 1 },
  time: { color: "#1677C8", fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 1 },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  closeText: { color: "#607387", fontSize: 25, lineHeight: 29, fontWeight: "400" },
  notice: { backgroundColor: "#EAF4FF", borderRadius: 14, padding: 12, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  noticeText: { color: "#3169A7", fontSize: 12, lineHeight: 17, fontWeight: "600", flex: 1 },
  sectionTitle: { color: "#24344B", fontSize: 15, lineHeight: 20, fontWeight: "800", marginTop: 21, marginBottom: 7 },
  body: { color: "#66778B", fontSize: 13, lineHeight: 19, fontWeight: "500", flex: 1 },
  metricGrid: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, backgroundColor: "#F4F7FB", borderRadius: 14, padding: 12 },
  metricValue: { color: "#1F3450", fontSize: 16, lineHeight: 22, fontWeight: "800" },
  metricLabel: { color: "#7C8D9F", fontSize: 10, lineHeight: 14, fontWeight: "600", marginTop: 2 },
  bullet: { flexDirection: "row", gap: 9, marginBottom: 9 },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  official: { backgroundColor: "#0B1B3A", borderRadius: 18, padding: 16, marginTop: 22 },
  officialTitle: { color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "800" },
  officialCopy: { color: "#C7D8ED", fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 3 },
  officialButton: { marginTop: 14, minHeight: 40, borderRadius: 12, backgroundColor: "#1677C8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  officialButtonText: { color: "#FFFFFF", fontSize: 13, lineHeight: 18, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
