import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/productivity/empty-state";
import { GoalCard } from "@/components/productivity/goal-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useProductivity } from "@/lib/productivity-store";
import { getGoalProgress } from "@/lib/productivity-utils";

export default function GoalsScreen() {
  const { goals, hydrated, openGoalComposer } = useProductivity();
  const average = goals.length ? Math.round(goals.reduce((sum, goal) => sum + getGoalProgress(goal), 0) / goals.length) : 0;

  if (!hydrated) return <ScreenContainer><View style={styles.loader}><ActivityIndicator color="#3B5BDB" /></View></ScreenContainer>;

  return (
    <ScreenContainer>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<><View style={styles.header}><View><Text style={styles.title}>Metas</Text><Text style={styles.subtitle}>Todo avanço tem um destino.</Text></View><View style={styles.targetIcon}><IconSymbol name="target" size={21} color="#3B5BDB" /></View></View><View style={styles.overview}><View><Text style={styles.overviewEyebrow}>VISÃO GERAL</Text><Text style={styles.overviewValue}>{average}%</Text><Text style={styles.overviewText}>{goals.length ? "de progresso médio" : "pronto para um novo começo"}</Text></View><View style={styles.overviewCircle}><Text style={styles.overviewCircleText}>{goals.length}</Text><Text style={styles.overviewCircleCaption}>{goals.length === 1 ? "META" : "METAS"}</Text></View></View><Text style={styles.listLabel}>SUAS METAS</Text></>}
        ListEmptyComponent={<EmptyState icon="target" title="Escolha uma direção" description="Uma meta transforma tarefas soltas em progresso mensurável." actionLabel="Criar uma meta" onAction={() => openGoalComposer()} />}
        renderItem={({ item }) => <GoalCard goal={item} />}
        ListFooterComponent={<View style={styles.bottomPadding} />}
      />
      <Pressable onPress={() => openGoalComposer()} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}><IconSymbol name="plus" size={28} color="#FFFFFF" /></Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 100 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { color: "#1D2433", fontSize: 28, lineHeight: 34, fontWeight: "850" },
  subtitle: { color: "#7B8496", fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 2 },
  targetIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#E9EDFF", justifyContent: "center", alignItems: "center" },
  overview: { backgroundColor: "#182552", borderRadius: 24, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  overviewEyebrow: { color: "#99A8DD", fontSize: 10, lineHeight: 14, fontWeight: "850", letterSpacing: 1 },
  overviewValue: { color: "#FFFFFF", fontSize: 34, lineHeight: 40, fontWeight: "850", marginTop: 3 },
  overviewText: { color: "#C2CBE9", fontSize: 13, lineHeight: 18, fontWeight: "600" },
  overviewCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#2A3A71", alignItems: "center", justifyContent: "center" },
  overviewCircleText: { color: "#FFFFFF", fontSize: 20, lineHeight: 24, fontWeight: "850" },
  overviewCircleCaption: { color: "#C2CBE9", fontSize: 9, lineHeight: 12, fontWeight: "850", letterSpacing: 0.6 },
  listLabel: { color: "#8B94A5", fontSize: 10, lineHeight: 14, fontWeight: "850", letterSpacing: 0.8, marginTop: 26, marginBottom: 11 },
  fab: { position: "absolute", right: 22, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3B5BDB", alignItems: "center", justifyContent: "center", shadowColor: "#3B5BDB", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  fabPressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  bottomPadding: { height: 14 },
} as any);
