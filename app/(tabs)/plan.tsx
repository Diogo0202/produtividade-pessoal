import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/productivity/empty-state";
import { TaskRow } from "@/components/productivity/task-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useProductivity } from "@/lib/productivity-store";
import { formatLongDate, getTodayKey, getWeekDays } from "@/lib/productivity-utils";

export default function PlanScreen() {
  const { tasks, hydrated, openTaskComposer } = useProductivity();
  const today = getTodayKey();
  const [selectedDate, setSelectedDate] = useState(today);
  const weekDays = useMemo(() => getWeekDays(), []);
  const planned = tasks.filter((task) => task.date === selectedDate).sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));

  if (!hydrated) return <ScreenContainer><View style={styles.loader}><ActivityIndicator color="#3B5BDB" /></View></ScreenContainer>;

  return (
    <ScreenContainer>
      <FlatList
        data={planned}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}><View><Text style={styles.title}>Planejar</Text><Text style={styles.subtitle}>Dê um horário ao que importa.</Text></View><View style={styles.calendarIcon}><IconSymbol name="calendar" size={20} color="#3B5BDB" /></View></View>
            <FlatList
              horizontal
              data={weekDays}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weekStrip}
              renderItem={({ item }) => <DayButton item={item} selected={selectedDate === item.key} isToday={item.key === today} onPress={() => setSelectedDate(item.key)} />}
            />
            <View style={styles.dayHeading}><View><Text style={styles.dayTitle}>{selectedDate === today ? "Hoje" : formatLongDate(selectedDate)}</Text><Text style={styles.daySubtitle}>{planned.length ? `${planned.length} blocos no seu dia` : "Nenhum bloco reservado"}</Text></View><Pressable onPress={() => openTaskComposer(undefined, { date: selectedDate })} style={({ pressed }) => [styles.addTiny, pressed && styles.pressed]}><Text style={styles.addTinyText}>Adicionar</Text></Pressable></View>
            {planned.length > 0 && <View style={styles.timelineLabel}><Text style={styles.timelineText}>LINHA DO TEMPO</Text><View style={styles.timelineRule} /></View>}
          </>
        }
        ListEmptyComponent={<EmptyState icon="calendar" title="Crie espaço para o que importa" description="Reserve um bloco e veja seu dia ganhar direção." actionLabel="Planejar tarefa" onAction={() => openTaskComposer(undefined, { date: selectedDate })} />}
        renderItem={({ item }) => <View style={styles.timeRow}><Text style={styles.time}>{item.time || "Livre"}</Text><View style={styles.timeLine}><View style={styles.timeDot} /><View style={styles.line} /></View><View style={styles.taskWrap}><TaskRow task={item} compact /></View></View>}
        ListFooterComponent={<View style={styles.bottomPadding} />}
      />
      <Pressable onPress={() => openTaskComposer(undefined, { date: selectedDate })} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}><IconSymbol name="plus" size={28} color="#FFFFFF" /></Pressable>
    </ScreenContainer>
  );
}

function DayButton({ item, selected, isToday, onPress }: { item: { key: string; label: string; day: number }; selected: boolean; isToday: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.dayButton, selected && styles.dayButtonSelected, pressed && styles.pressed]}><Text style={[styles.weekday, selected && styles.dayTextSelected]}>{item.label}</Text><Text style={[styles.dayNumber, selected && styles.dayTextSelected]}>{item.day}</Text>{isToday && !selected && <View style={styles.todayDot} />}</Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 100 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { color: "#1D2433", fontSize: 28, lineHeight: 34, fontWeight: "850" },
  subtitle: { color: "#7B8496", fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 2 },
  calendarIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#E9EDFF", justifyContent: "center", alignItems: "center" },
  weekStrip: { gap: 8, paddingBottom: 4 },
  dayButton: { width: 47, height: 66, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEF0F5", alignItems: "center", justifyContent: "center" },
  dayButtonSelected: { backgroundColor: "#3B5BDB", borderColor: "#3B5BDB" },
  weekday: { color: "#8B94A5", fontSize: 10, lineHeight: 13, fontWeight: "800", textTransform: "uppercase" },
  dayNumber: { color: "#283042", fontSize: 17, lineHeight: 22, fontWeight: "850", marginTop: 2 },
  dayTextSelected: { color: "#FFFFFF" },
  todayDot: { position: "absolute", bottom: 7, width: 4, height: 4, borderRadius: 2, backgroundColor: "#3B5BDB" },
  dayHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 25, marginBottom: 18 },
  dayTitle: { color: "#1D2433", fontSize: 20, lineHeight: 26, fontWeight: "850", textTransform: "capitalize" },
  daySubtitle: { color: "#8B94A5", fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 1 },
  addTiny: { backgroundColor: "#E9EDFF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  addTinyText: { color: "#3B5BDB", fontSize: 12, lineHeight: 16, fontWeight: "850" },
  timelineLabel: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 12 },
  timelineText: { color: "#8B94A5", fontSize: 10, lineHeight: 14, letterSpacing: 0.8, fontWeight: "850" },
  timelineRule: { height: 1, flex: 1, backgroundColor: "#E2E5ED" },
  timeRow: { flexDirection: "row", alignItems: "stretch" },
  time: { width: 45, color: "#747E91", fontSize: 12, lineHeight: 17, fontWeight: "800", paddingTop: 17 },
  timeLine: { width: 22, alignItems: "center" },
  timeDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#3B5BDB", marginTop: 20, zIndex: 1 },
  line: { width: 1, flex: 1, backgroundColor: "#DDE2F4", position: "absolute", top: 25, bottom: -8 },
  taskWrap: { flex: 1, minWidth: 0 },
  fab: { position: "absolute", right: 22, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3B5BDB", alignItems: "center", justifyContent: "center", shadowColor: "#3B5BDB", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  fabPressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  pressed: { opacity: 0.72 },
  bottomPadding: { height: 14 },
} as any);
