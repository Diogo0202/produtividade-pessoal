import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { WEATHER_KNOWLEDGE } from "@/lib/weather-knowledge";
import { useWeather } from "@/lib/weather-store";
import type { RiskLevel, WeatherEventKind } from "@/lib/weather-types";

const FILTERS: Array<{ kind: WeatherEventKind; label: string; description: string }> = [
  { kind: "trovoada", label: "Tempestades", description: "Trovoadas e descargas elétricas" },
  { kind: "chuva", label: "Chuva intensa", description: "Acúmulo e precipitação elevada" },
  { kind: "vento", label: "Ventos fortes", description: "Rajadas e ventos relevantes" },
  { kind: "calor", label: "Ondas de calor", description: "Estresse térmico e índice UV" },
  { kind: "visibilidade", label: "Visibilidade", description: "Neblina e redução de alcance visual" },
];

const LEVELS: Array<{ level: RiskLevel; label: string; description: string; color: string }> = [
  { level: "alto", label: "Risco alto", description: "Priorizar eventos mais perigosos", color: "#D95363" },
  { level: "moderado", label: "Risco moderado", description: "Acompanhar condições de atenção", color: "#E48B2C" },
];

export function MapFilterDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { activeEventKinds, activeRiskLevels, eventCounts, preferencesReady, toggleEventKind, toggleRiskLevel, clearAllFilters } = useWeather();
  const hasSelection = activeEventKinds.length > 0 || activeRiskLevels.length > 0;
  const selectedFilters = activeEventKinds.length + activeRiskLevels.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <View style={styles.drawer}>
          <View style={styles.header}><View><Text style={styles.eyebrow}>EXIBIÇÃO NO MAPA</Text><Text style={styles.title}>Filtrar eventos</Text></View><Pressable onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}><Text style={styles.closeText}>×</Text></Pressable></View>
          <View style={styles.intro}><IconSymbol name="info" size={17} color="#386EA5" /><Text style={styles.introText}>As escolhas são salvas automaticamente para o próximo acesso.</Text></View>
          <Pressable onPress={clearAllFilters} style={({ pressed }) => [styles.allRow, !hasSelection && styles.allRowActive, pressed && styles.pressed]}><View style={[styles.check, !hasSelection && styles.checkActive]}>{!hasSelection && <IconSymbol name="checkmark" size={16} color="#FFFFFF" />}</View><View style={styles.rowCopy}><Text style={styles.allLabel}>Todos os eventos</Text><Text style={styles.rowDescription}>Mostrar todas as categorias e severidades</Text></View></Pressable>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>TIPOS DE EVENTO</Text>
          {FILTERS.map((item) => { const selected = activeEventKinds.includes(item.kind); const knowledge = WEATHER_KNOWLEDGE[item.kind]; return <Pressable key={item.kind} onPress={() => toggleEventKind(item.kind)} style={({ pressed }) => [styles.eventRow, selected && styles.eventRowSelected, pressed && styles.pressed]}><View style={[styles.check, selected && { backgroundColor: knowledge.color, borderColor: knowledge.color }]}>{selected && <IconSymbol name="checkmark" size={16} color="#FFFFFF" />}</View><View style={[styles.eventIcon, { backgroundColor: `${knowledge.color}18` }]}><IconSymbol name={knowledge.icon} size={19} color={knowledge.color} /></View><View style={styles.rowCopy}><Text style={styles.eventLabel}>{item.label}</Text><Text style={styles.rowDescription}>{item.description}</Text></View><View style={styles.countBadge}><Text style={styles.countText}>{eventCounts[item.kind]}</Text></View></Pressable>; })}
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>NÍVEL DE SEVERIDADE</Text>
          {LEVELS.map((item) => { const selected = activeRiskLevels.includes(item.level); return <Pressable key={item.level} onPress={() => toggleRiskLevel(item.level)} style={({ pressed }) => [styles.eventRow, selected && styles.eventRowSelected, pressed && styles.pressed]}><View style={[styles.check, selected && { backgroundColor: item.color, borderColor: item.color }]}>{selected && <IconSymbol name="checkmark" size={16} color="#FFFFFF" />}</View><View style={[styles.severityDot, { backgroundColor: item.color }]} /><View style={styles.rowCopy}><Text style={styles.eventLabel}>{item.label}</Text><Text style={styles.rowDescription}>{item.description}</Text></View></Pressable>; })}
          <View style={styles.footer}><Text style={styles.footerCopy}>{preferencesReady ? (hasSelection ? `${selectedFilters} filtro${selectedFilters > 1 ? "s" : ""} ativo${selectedFilters > 1 ? "s" : ""} · preferências salvas` : "Todos os tipos selecionados · preferências salvas") : "Salvando preferências…"}</Text><Pressable onPress={onClose} style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}><Text style={styles.applyText}>Ver no mapa</Text></Pressable></View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({ overlay: { flex: 1, flexDirection: "row" }, backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(6, 20, 43, 0.42)" }, drawer: { width: "84%", maxWidth: 340, height: "100%", backgroundColor: "#FFFFFF", paddingTop: 52, paddingHorizontal: 18, paddingBottom: 18, shadowColor: "#0B1B3A", shadowOpacity: 0.22, shadowRadius: 18, elevation: 10 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }, eyebrow: { color: "#1677C8", fontSize: 9, lineHeight: 13, letterSpacing: 0.8, fontWeight: "800" }, title: { color: "#18243A", fontSize: 24, lineHeight: 30, fontWeight: "800", marginTop: 1 }, close: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EEF3F8", alignItems: "center", justifyContent: "center" }, closeText: { color: "#5C7087", fontSize: 25, lineHeight: 28, fontWeight: "400" }, intro: { flexDirection: "row", gap: 8, backgroundColor: "#EAF4FF", borderRadius: 14, padding: 12, alignItems: "flex-start" }, introText: { color: "#386EA5", fontSize: 12, lineHeight: 17, fontWeight: "600", flex: 1 }, allRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 13, paddingHorizontal: 9, borderRadius: 14, marginTop: 10 }, allRowActive: { backgroundColor: "#F0F7FF" }, check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: "#B7C7D7", alignItems: "center", justifyContent: "center" }, checkActive: { backgroundColor: "#1677C8", borderColor: "#1677C8" }, rowCopy: { flex: 1 }, allLabel: { color: "#213850", fontSize: 14, lineHeight: 19, fontWeight: "800" }, rowDescription: { color: "#75889D", fontSize: 11, lineHeight: 15, fontWeight: "600", marginTop: 1 }, divider: { height: 1, backgroundColor: "#E5ECF3", marginVertical: 3 }, sectionLabel: { color: "#778B9F", fontSize: 9, lineHeight: 13, letterSpacing: 0.8, fontWeight: "800", marginTop: 10, marginBottom: 4 }, eventRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 14, marginBottom: 1 }, eventRowSelected: { backgroundColor: "#F5F8FC" }, eventIcon: { width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center" }, eventLabel: { color: "#263D58", fontSize: 13, lineHeight: 18, fontWeight: "800" }, countBadge: { minWidth: 26, height: 24, borderRadius: 12, backgroundColor: "#E8F1FA", alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }, countText: { color: "#386EA5", fontSize: 11, lineHeight: 14, fontWeight: "800" }, severityDot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 10 }, footer: { marginTop: "auto", paddingTop: 13, borderTopWidth: 1, borderTopColor: "#E5ECF3" }, footerCopy: { color: "#6D8196", fontSize: 10, lineHeight: 15, textAlign: "center", fontWeight: "700", marginBottom: 10 }, applyButton: { minHeight: 46, borderRadius: 14, backgroundColor: "#1677C8", alignItems: "center", justifyContent: "center" }, applyText: { color: "#FFFFFF", fontSize: 14, lineHeight: 19, fontWeight: "800" }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });
