import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useProductivity } from "@/lib/productivity-store";
import { formatShortDate, getGoalProgress, type ProductivityGoal } from "@/lib/productivity-utils";

export function GoalCard({ goal }: { goal: ProductivityGoal }) {
  const { tasks, openGoalComposer, updateGoalProgress } = useProductivity();
  const progress = getGoalProgress(goal);
  const linked = tasks.filter((task) => task.goalId === goal.id);
  const completedLinked = linked.filter((task) => task.completed).length;
  const increment = Math.max(1, Math.ceil(goal.targetValue / 10));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.colorMark, { backgroundColor: goal.color }]} />
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>{goal.title}</Text>
          <Text style={styles.subtitle}>{goal.deadline ? `Até ${formatShortDate(goal.deadline)}` : "Sem prazo definido"}</Text>
        </View>
        <Pressable onPress={() => openGoalComposer(goal)} style={({ pressed }) => [styles.edit, pressed && styles.pressed]}>
          <IconSymbol name="pencil" size={17} color="#697386" />
        </Pressable>
      </View>

      <View style={styles.progressLine}>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: goal.color }]} /></View>
        <Text style={styles.percent}>{progress}%</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.value}>{goal.currentValue} de {goal.targetValue} {goal.unit}</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => updateGoalProgress(goal.id, goal.currentValue - increment)} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Text style={styles.stepText}>−</Text></Pressable>
          <Pressable onPress={() => updateGoalProgress(goal.id, Math.min(goal.targetValue, goal.currentValue + increment))} style={({ pressed }) => [styles.stepButton, { backgroundColor: goal.color }, pressed && styles.pressed]}><Text style={[styles.stepText, styles.stepTextLight]}>+</Text></Pressable>
        </View>
      </View>
      {linked.length > 0 && <Text style={styles.linked}>{completedLinked}/{linked.length} tarefas vinculadas concluídas</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1, borderColor: "#EEF0F5", padding: 17, marginBottom: 12 },
  topRow: { flexDirection: "row", alignItems: "flex-start" },
  colorMark: { width: 10, height: 34, borderRadius: 5, marginRight: 11, marginTop: 1 },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { color: "#1D2433", fontSize: 17, lineHeight: 23, fontWeight: "800" },
  subtitle: { color: "#8992A2", fontSize: 12, lineHeight: 16, fontWeight: "600", marginTop: 2 },
  edit: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F3F5F9", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  progressLine: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 20 },
  progressTrack: { height: 8, flex: 1, borderRadius: 5, backgroundColor: "#EDEFF5", overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 5 },
  percent: { color: "#1D2433", width: 36, textAlign: "right", fontSize: 13, lineHeight: 18, fontWeight: "800" },
  bottomRow: { marginTop: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  value: { color: "#697386", fontSize: 13, lineHeight: 18, fontWeight: "650", flex: 1 },
  stepper: { flexDirection: "row", gap: 7 },
  stepButton: { width: 31, height: 31, borderRadius: 10, backgroundColor: "#F0F2F7", alignItems: "center", justifyContent: "center" },
  stepText: { color: "#596173", fontSize: 20, lineHeight: 23, fontWeight: "700" },
  stepTextLight: { color: "#FFFFFF" },
  linked: { color: "#8B94A5", fontSize: 11, lineHeight: 15, fontWeight: "650", marginTop: 12 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
} as any);
