import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/productivity/empty-state";
import { TaskRow } from "@/components/productivity/task-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useProductivity } from "@/lib/productivity-store";
import { formatLongDate, getTaskStats, getTodayKey } from "@/lib/productivity-utils";

export default function TodayScreen() {
  const { tasks, hydrated, openTaskComposer } = useProductivity();
  const today = getTodayKey();
  const todaysTasks = tasks.filter((task) => task.date === today).sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
  const stats = getTaskStats(tasks, today);
  const nextTask = todaysTasks.find((task) => !task.completed);
  const progress = Math.round(stats.completionRatio * 100);
  const greeting = new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";

  if (!hydrated) return <ScreenContainer><View style={styles.loader}><ActivityIndicator color="#3B5BDB" /></View></ScreenContainer>;

  return (
    <ScreenContainer containerClassName="bg-background">
      <FlatList
        data={todaysTasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.date}>{formatLongDate(today)}</Text>
              </View>
              <View style={styles.avatar}><Text style={styles.avatarText}>R</Text></View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryEyebrow}>SEU RITMO DE HOJE</Text>
                  <Text style={styles.summaryValue}>{stats.completed}<Text style={styles.summarySmall}>/{stats.total}</Text></Text>
                  <Text style={styles.summaryCopy}>{stats.total ? "tarefas concluídas" : "um dia pronto para começar"}</Text>
                </View>
                <View style={styles.percentBubble}><Text style={styles.percentText}>{progress}%</Text></View>
              </View>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
            </View>

            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Seu foco agora</Text><Text style={styles.sectionCaption}>{nextTask ? "PRÓXIMA AÇÃO" : "ESPAÇO ABERTO"}</Text></View>
            <View style={styles.focusCard}>
              <View style={styles.focusIcon}><IconSymbol name={nextTask ? "clock.fill" : "sparkles"} size={20} color="#3B5BDB" /></View>
              <View style={styles.focusTextWrap}>
                <Text style={styles.focusTitle}>{nextTask ? nextTask.title : "Comece com uma intenção"}</Text>
                <Text style={styles.focusDescription}>{nextTask ? `${nextTask.time ? `${nextTask.time} · ` : ""}Escolha um pequeno próximo passo.` : "Organize uma tarefa e transforme o tempo em progresso."}</Text>
              </View>
            </View>

            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Hoje</Text><Text style={styles.sectionCaption}>{stats.total} {stats.total === 1 ? "TAREFA" : "TAREFAS"}</Text></View>
          </>
        }
        ListEmptyComponent={<EmptyState icon="checklist" title="Seu dia está leve" description="Adicione a primeira tarefa para transformar intenção em ação." actionLabel="Adicionar tarefa" onAction={() => openTaskComposer(undefined, { date: today })} />}
        renderItem={({ item }) => <TaskRow task={item} />}
        ListFooterComponent={<View style={styles.bottomPadding} />}
      />
      <Pressable onPress={() => openTaskComposer(undefined, { date: today })} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  greeting: { color: "#1D2433", fontSize: 26, lineHeight: 32, fontWeight: "850" },
  date: { color: "#7B8496", fontSize: 14, lineHeight: 20, fontWeight: "600", textTransform: "capitalize", marginTop: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#E8ECFF", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#3B5BDB", fontSize: 17, lineHeight: 21, fontWeight: "850" },
  summaryCard: { backgroundColor: "#3B5BDB", borderRadius: 24, padding: 20, shadowColor: "#3B5BDB", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  summaryEyebrow: { color: "#C9D2FF", fontSize: 10, lineHeight: 14, letterSpacing: 1, fontWeight: "800" },
  summaryValue: { color: "#FFFFFF", fontSize: 36, lineHeight: 42, fontWeight: "850", marginTop: 3 },
  summarySmall: { color: "#BBC7FF", fontSize: 20 },
  summaryCopy: { color: "#DCE2FF", fontSize: 13, lineHeight: 18, fontWeight: "600" },
  percentBubble: { backgroundColor: "rgba(255,255,255,0.14)", width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  percentText: { color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "850" },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)", marginTop: 17, overflow: "hidden" },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: "#A8E6CC" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 27, marginBottom: 11 },
  sectionTitle: { color: "#1D2433", fontSize: 18, lineHeight: 24, fontWeight: "850" },
  sectionCaption: { color: "#8B94A5", fontSize: 10, lineHeight: 14, letterSpacing: 0.7, fontWeight: "800" },
  focusCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEF0F5", borderRadius: 19, padding: 15, flexDirection: "row", alignItems: "center" },
  focusIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#ECF0FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  focusTextWrap: { flex: 1 },
  focusTitle: { color: "#283042", fontSize: 15, lineHeight: 20, fontWeight: "800" },
  focusDescription: { color: "#7A8495", fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 2 },
  fab: { position: "absolute", right: 22, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3B5BDB", alignItems: "center", justifyContent: "center", shadowColor: "#3B5BDB", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  fabPressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  bottomPadding: { height: 14 },
} as any);
