import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/productivity/empty-state";
import { TaskRow } from "@/components/productivity/task-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useProductivity } from "@/lib/productivity-store";
import type { ProductivityTask } from "@/lib/productivity-utils";

type Filter = "todas" | "abertas" | "concluídas";

export default function TasksScreen() {
  const { tasks, hydrated, openTaskComposer } = useProductivity();
  const [filter, setFilter] = useState<Filter>("abertas");
  const filtered = useMemo(() => tasks.filter((task) => filter === "todas" || (filter === "abertas" ? !task.completed : task.completed)), [filter, tasks]);
  const sorted = [...filtered].sort((a, b) => Number(a.completed) - Number(b.completed) || (a.date ?? "9999").localeCompare(b.date ?? "9999"));

  if (!hydrated) return <ScreenContainer><View style={styles.loader}><ActivityIndicator color="#3B5BDB" /></View></ScreenContainer>;

  return (
    <ScreenContainer>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<TasksHeader filter={filter} count={tasks.filter((task) => !task.completed).length} onFilter={setFilter} />}
        ListEmptyComponent={<EmptyState icon="checklist" title={filter === "concluídas" ? "Ainda não há conquistas aqui" : "Sua lista está pronta para começar"} description={filter === "concluídas" ? "Conclua uma tarefa para manter seus avanços visíveis." : "Crie uma tarefa e dê a ela um lugar no seu ritmo."} actionLabel="Criar tarefa" onAction={() => openTaskComposer()} />}
        renderItem={({ item }) => <TaskRow task={item as ProductivityTask} />}
        ListFooterComponent={<View style={styles.bottomPadding} />}
      />
      <Pressable onPress={() => openTaskComposer()} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}><IconSymbol name="plus" size={28} color="#FFFFFF" /></Pressable>
    </ScreenContainer>
  );
}

function TasksHeader({ filter, count, onFilter }: { filter: Filter; count: number; onFilter: (filter: Filter) => void }) {
  return (
    <>
      <View style={styles.header}><View><Text style={styles.title}>Tarefas</Text><Text style={styles.subtitle}>{count ? `${count} abertas aguardando atenção` : "Tudo em dia por aqui"}</Text></View><View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View></View>
      <View style={styles.filters}>
        <FilterButton active={filter === "abertas"} label="Abertas" onPress={() => onFilter("abertas")} />
        <FilterButton active={filter === "todas"} label="Todas" onPress={() => onFilter("todas")} />
        <FilterButton active={filter === "concluídas"} label="Concluídas" onPress={() => onFilter("concluídas")} />
      </View>
    </>
  );
}

function FilterButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.filter, active && styles.filterActive, pressed && styles.pressed]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 100 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 19 },
  title: { color: "#1D2433", fontSize: 28, lineHeight: 34, fontWeight: "850" },
  subtitle: { color: "#7B8496", fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 2 },
  countBadge: { backgroundColor: "#E9EDFF", minWidth: 38, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  countText: { color: "#3B5BDB", fontSize: 14, lineHeight: 18, fontWeight: "850" },
  filters: { flexDirection: "row", gap: 8, marginBottom: 18 },
  filter: { backgroundColor: "#F0F2F7", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 },
  filterActive: { backgroundColor: "#3B5BDB" },
  filterText: { color: "#697386", fontSize: 13, lineHeight: 17, fontWeight: "750" },
  filterTextActive: { color: "#FFFFFF" },
  fab: { position: "absolute", right: 22, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3B5BDB", alignItems: "center", justifyContent: "center", shadowColor: "#3B5BDB", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  fabPressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  pressed: { opacity: 0.72 },
  bottomPadding: { height: 14 },
} as any);
