import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useProductivity } from "@/lib/productivity-store";
import { formatShortDate, getTodayKey, priorityColor, priorityLabel, type ProductivityTask } from "@/lib/productivity-utils";

export function TaskRow({ task, compact = false }: { task: ProductivityTask; compact?: boolean }) {
  const { goals, toggleTask, openTaskComposer } = useProductivity();
  const goal = task.goalId ? goals.find((item) => item.id === task.goalId) : undefined;
  const details = [task.time, task.date && task.date !== getTodayKey() ? formatShortDate(task.date) : task.date ? "Hoje" : undefined].filter(Boolean).join(" · ");

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Pressable onPress={() => toggleTask(task.id)} style={({ pressed }) => [styles.checkButton, task.completed && styles.checkButtonDone, pressed && styles.pressed]}>
        <IconSymbol name={task.completed ? "checkmark" : "circle"} size={task.completed ? 16 : 20} color={task.completed ? "#FFFFFF" : "#B1B8C7"} />
      </Pressable>
      <Pressable onPress={() => openTaskComposer(task)} style={({ pressed }) => [styles.content, pressed && styles.pressed]}>
        <View style={styles.titleLine}>
          <Text style={[styles.title, task.completed && styles.titleDone]} numberOfLines={2}>{task.title}</Text>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor(task.priority) }]} />
        </View>
        <View style={styles.metaLine}>
          {details ? <Text style={styles.meta}>{details}</Text> : <Text style={styles.meta}>Sem horário definido</Text>}
          {goal ? <Text style={[styles.goal, { color: goal.color }]} numberOfLines={1}>· {goal.title}</Text> : null}
        </View>
      </Pressable>
    </View>
  );
}

export function PriorityPill({ priority }: { priority: ProductivityTask["priority"] }) {
  return <View style={[styles.pill, { backgroundColor: `${priorityColor(priority)}18` }]}><Text style={[styles.pillText, { color: priorityColor(priority) }]}>{priorityLabel(priority)}</Text></View>;
}

const styles = StyleSheet.create({
  row: { backgroundColor: "#FFFFFF", minHeight: 72, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EEF0F5", marginBottom: 10 },
  rowCompact: { minHeight: 66, marginBottom: 8 },
  checkButton: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: "#C9CFDC", justifyContent: "center", alignItems: "center", marginRight: 12 },
  checkButtonDone: { backgroundColor: "#2F9E78", borderColor: "#2F9E78" },
  content: { flex: 1, minWidth: 0 },
  titleLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: "#1D2433", flex: 1, fontSize: 15, lineHeight: 20, fontWeight: "750" },
  titleDone: { color: "#98A1B0", textDecorationLine: "line-through" },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  metaLine: { flexDirection: "row", alignItems: "center", marginTop: 4, minWidth: 0 },
  meta: { color: "#8B94A5", fontSize: 12, lineHeight: 16, fontWeight: "600" },
  goal: { fontSize: 12, lineHeight: 16, fontWeight: "700", flexShrink: 1 },
  pill: { borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 10, lineHeight: 13, fontWeight: "800" },
  pressed: { opacity: 0.66 },
} as any);
