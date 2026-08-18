import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  getTodayKey,
  type ProductivityGoal,
  type ProductivityTask,
  type TaskPriority,
} from "@/lib/productivity-utils";

const STORAGE_KEY = "ritmo-productivity-data-v1";
const GOAL_COLORS = ["#3B5BDB", "#2F9E78", "#B05AD9", "#E58C33"];

type TaskDraft = Pick<ProductivityTask, "title" | "priority" | "date" | "time" | "duration" | "goalId">;
type GoalDraft = Pick<ProductivityGoal, "title" | "unit" | "currentValue" | "targetValue" | "deadline" | "color">;
type ComposerTarget =
  | { type: "task"; task?: ProductivityTask; prefill?: Partial<TaskDraft> }
  | { type: "goal"; goal?: ProductivityGoal }
  | null;

type ProductivityContextValue = {
  tasks: ProductivityTask[];
  goals: ProductivityGoal[];
  hydrated: boolean;
  createTask: (draft: TaskDraft) => void;
  updateTask: (id: string, draft: TaskDraft) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  createGoal: (draft: GoalDraft) => void;
  updateGoal: (id: string, draft: GoalDraft) => void;
  updateGoalProgress: (id: string, value: number) => void;
  deleteGoal: (id: string) => void;
  openTaskComposer: (task?: ProductivityTask, prefill?: Partial<TaskDraft>) => void;
  openGoalComposer: (goal?: ProductivityGoal) => void;
  closeComposer: () => void;
};

const ProductivityContext = createContext<ProductivityContextValue | null>(null);

function haptic(type: "light" | "success" | "medium") {
  if (Platform.OS === "web") return;
  if (type === "success") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }
  void Haptics.impactAsync(
    type === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
  );
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ProductivityProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<ProductivityTask[]>([]);
  const [goals, setGoals] = useState<ProductivityGoal[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [composer, setComposer] = useState<ComposerTarget>(null);

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw || !active) return;
        const saved = JSON.parse(raw) as { tasks?: ProductivityTask[]; goals?: ProductivityGoal[] };
        setTasks(Array.isArray(saved.tasks) ? saved.tasks : []);
        setGoals(Array.isArray(saved.goals) ? saved.goals : []);
      } catch {
        // A falha de persistência não deve impedir o uso local do aplicativo.
      } finally {
        if (active) setHydrated(true);
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, goals }));
  }, [tasks, goals, hydrated]);

  const createTask = useCallback((draft: TaskDraft) => {
    const task: ProductivityTask = {
      id: makeId("task"),
      title: draft.title.trim(),
      completed: false,
      priority: draft.priority,
      date: draft.date || undefined,
      time: draft.time || undefined,
      duration: draft.duration,
      goalId: draft.goalId || undefined,
      createdAt: new Date().toISOString(),
    };
    setTasks((current) => [task, ...current]);
    haptic("light");
  }, []);

  const updateTask = useCallback((id: string, draft: TaskDraft) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              title: draft.title.trim(),
              priority: draft.priority,
              date: draft.date || undefined,
              time: draft.time || undefined,
              duration: draft.duration,
              goalId: draft.goalId || undefined,
            }
          : task,
      ),
    );
    haptic("light");
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((current) => {
      const target = current.find((task) => task.id === id);
      if (target && !target.completed) haptic("success");
      else haptic("light");
      return current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
    haptic("medium");
  }, []);

  const createGoal = useCallback((draft: GoalDraft) => {
    const goal: ProductivityGoal = {
      id: makeId("goal"),
      title: draft.title.trim(),
      unit: draft.unit.trim() || "etapas",
      currentValue: draft.currentValue,
      targetValue: Math.max(1, draft.targetValue),
      deadline: draft.deadline || undefined,
      color: draft.color,
      createdAt: new Date().toISOString(),
    };
    setGoals((current) => [goal, ...current]);
    haptic("light");
  }, []);

  const updateGoal = useCallback((id: string, draft: GoalDraft) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              title: draft.title.trim(),
              unit: draft.unit.trim() || "etapas",
              currentValue: draft.currentValue,
              targetValue: Math.max(1, draft.targetValue),
              deadline: draft.deadline || undefined,
              color: draft.color,
            }
          : goal,
      ),
    );
    haptic("light");
  }, []);

  const updateGoalProgress = useCallback((id: string, value: number) => {
    setGoals((current) =>
      current.map((goal) => (goal.id === id ? { ...goal, currentValue: Math.max(0, value) } : goal)),
    );
    haptic("light");
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((current) => current.filter((goal) => goal.id !== id));
    setTasks((current) => current.map((task) => (task.goalId === id ? { ...task, goalId: undefined } : task)));
    haptic("medium");
  }, []);

  const value = useMemo<ProductivityContextValue>(
    () => ({
      tasks,
      goals,
      hydrated,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
      createGoal,
      updateGoal,
      updateGoalProgress,
      deleteGoal,
      openTaskComposer: (task, prefill) => setComposer({ type: "task", task, prefill }),
      openGoalComposer: (goal) => setComposer({ type: "goal", goal }),
      closeComposer: () => setComposer(null),
    }),
    [createGoal, createTask, deleteGoal, deleteTask, goals, hydrated, tasks, toggleTask, updateGoal, updateGoalProgress, updateTask],
  );

  return (
    <ProductivityContext.Provider value={value}>
      {children}
      <EntryComposer composer={composer} onClose={() => setComposer(null)} />
    </ProductivityContext.Provider>
  );
}

export function useProductivity() {
  const context = useContext(ProductivityContext);
  if (!context) throw new Error("useProductivity deve ser usado dentro de ProductivityProvider");
  return context;
}

function EntryComposer({ composer, onClose }: { composer: ComposerTarget; onClose: () => void }) {
  const { goals, createTask, updateTask, createGoal, updateGoal, deleteTask, deleteGoal } = useProductivity();
  const isTask = composer?.type === "task";
  const originalTask = composer?.type === "task" ? composer.task : undefined;
  const originalGoal = composer?.type === "goal" ? composer.goal : undefined;
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("média");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [goalId, setGoalId] = useState<string | undefined>();
  const [unit, setUnit] = useState("etapas");
  const [currentValue, setCurrentValue] = useState("0");
  const [targetValue, setTargetValue] = useState("1");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState(GOAL_COLORS[0]);

  useEffect(() => {
    if (!composer) return;
    if (composer.type === "task") {
      const item = composer.task;
      setTitle(item?.title ?? "");
      setPriority(item?.priority ?? composer.prefill?.priority ?? "média");
      setDate(item?.date ?? composer.prefill?.date ?? getTodayKey());
      setTime(item?.time ?? composer.prefill?.time ?? "");
      setGoalId(item?.goalId ?? composer.prefill?.goalId);
    } else {
      const item = composer.goal;
      setTitle(item?.title ?? "");
      setUnit(item?.unit ?? "etapas");
      setCurrentValue(String(item?.currentValue ?? 0));
      setTargetValue(String(item?.targetValue ?? 1));
      setDeadline(item?.deadline ?? "");
      setColor(item?.color ?? GOAL_COLORS[0]);
    }
  }, [composer]);

  const save = () => {
    if (!title.trim()) return;
    if (isTask) {
      const draft: TaskDraft = { title, priority, date, time, goalId };
      if (originalTask) updateTask(originalTask.id, draft);
      else createTask(draft);
    } else {
      const draft: GoalDraft = {
        title,
        unit,
        currentValue: Number(currentValue) || 0,
        targetValue: Math.max(1, Number(targetValue) || 1),
        deadline,
        color,
      };
      if (originalGoal) updateGoal(originalGoal.id, draft);
      else createGoal(draft);
    }
    onClose();
  };

  const remove = () => {
    if (originalTask) deleteTask(originalTask.id);
    if (originalGoal) deleteGoal(originalGoal.id);
    onClose();
  };

  return (
    <Modal visible={Boolean(composer)} transparent animationType="slide" onRequestClose={onClose}>
      <View style={composerStyles.overlay}>
        <Pressable onPress={onClose} style={composerStyles.backdrop} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={composerStyles.keyboardWrap}>
          <View style={composerStyles.sheet}>
            <View style={composerStyles.grabber} />
            <View style={composerStyles.sheetHeader}>
              <View>
                <Text style={composerStyles.eyebrow}>{isTask ? "ORGANIZE SEU DIA" : "DEFINA A DIREÇÃO"}</Text>
                <Text style={composerStyles.sheetTitle}>
                  {isTask ? (originalTask ? "Editar tarefa" : "Nova tarefa") : originalGoal ? "Editar meta" : "Nova meta"}
                </Text>
              </View>
              <Pressable onPress={onClose} style={({ pressed }) => [composerStyles.closeButton, pressed && composerStyles.pressed]}>
                <Text style={composerStyles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={composerStyles.label}>{isTask ? "O que precisa acontecer?" : "Qual resultado você quer alcançar?"}</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={isTask ? "Ex.: Preparar apresentação" : "Ex.: Ler 12 livros"}
                placeholderTextColor="#9BA3B1"
                style={composerStyles.titleInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={save}
              />

              {isTask ? (
                <>
                  <Text style={composerStyles.label}>Prioridade</Text>
                  <View style={composerStyles.segmented}>
                    <PriorityButton label="Baixa" selected={priority === "baixa"} onPress={() => setPriority("baixa")} />
                    <PriorityButton label="Média" selected={priority === "média"} onPress={() => setPriority("média")} />
                    <PriorityButton label="Alta" selected={priority === "alta"} onPress={() => setPriority("alta")} />
                  </View>

                  <View style={composerStyles.twoColumns}>
                    <View style={composerStyles.fieldColumn}>
                      <Text style={composerStyles.label}>Data</Text>
                      <TextInput value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" placeholderTextColor="#9BA3B1" style={composerStyles.smallInput} />
                    </View>
                    <View style={composerStyles.fieldColumn}>
                      <Text style={composerStyles.label}>Horário</Text>
                      <TextInput value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor="#9BA3B1" style={composerStyles.smallInput} />
                    </View>
                  </View>

                  <Text style={composerStyles.label}>Vincular a uma meta</Text>
                  <FlatList
                    horizontal
                    data={[{ id: "none", title: "Sem meta" }, ...goals]}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={composerStyles.goalChoices}
                    renderItem={({ item }) => {
                      const selected = (item.id === "none" && !goalId) || item.id === goalId;
                      return (
                        <Pressable
                          onPress={() => setGoalId(item.id === "none" ? undefined : item.id)}
                          style={({ pressed }) => [composerStyles.goalChoice, selected && composerStyles.goalChoiceSelected, pressed && composerStyles.pressed]}
                        >
                          <Text style={[composerStyles.goalChoiceText, selected && composerStyles.goalChoiceTextSelected]} numberOfLines={1}>
                            {item.title}
                          </Text>
                        </Pressable>
                      );
                    }}
                  />
                </>
              ) : (
                <>
                  <View style={composerStyles.twoColumns}>
                    <View style={composerStyles.fieldColumn}>
                      <Text style={composerStyles.label}>Valor atual</Text>
                      <TextInput value={currentValue} onChangeText={setCurrentValue} keyboardType="decimal-pad" style={composerStyles.smallInput} />
                    </View>
                    <View style={composerStyles.fieldColumn}>
                      <Text style={composerStyles.label}>Valor-meta</Text>
                      <TextInput value={targetValue} onChangeText={setTargetValue} keyboardType="decimal-pad" style={composerStyles.smallInput} />
                    </View>
                  </View>
                  <Text style={composerStyles.label}>Unidade</Text>
                  <TextInput value={unit} onChangeText={setUnit} placeholder="Ex.: sessões, km, páginas" placeholderTextColor="#9BA3B1" style={composerStyles.titleInput} />
                  <Text style={composerStyles.label}>Prazo</Text>
                  <TextInput value={deadline} onChangeText={setDeadline} placeholder="AAAA-MM-DD (opcional)" placeholderTextColor="#9BA3B1" style={composerStyles.titleInput} />
                  <Text style={composerStyles.label}>Cor da meta</Text>
                  <View style={composerStyles.colorRow}>
                    <ColorButton color="#3B5BDB" selected={color === "#3B5BDB"} onPress={() => setColor("#3B5BDB")} />
                    <ColorButton color="#2F9E78" selected={color === "#2F9E78"} onPress={() => setColor("#2F9E78")} />
                    <ColorButton color="#B05AD9" selected={color === "#B05AD9"} onPress={() => setColor("#B05AD9")} />
                    <ColorButton color="#E58C33" selected={color === "#E58C33"} onPress={() => setColor("#E58C33")} />
                  </View>
                </>
              )}

              <Pressable onPress={save} disabled={!title.trim()} style={({ pressed }) => [composerStyles.saveButton, !title.trim() && composerStyles.saveDisabled, pressed && composerStyles.pressed]}>
                <Text style={composerStyles.saveButtonText}>{originalTask || originalGoal ? "Salvar alterações" : "Adicionar ao Ritmo"}</Text>
              </Pressable>
              {(originalTask || originalGoal) && (
                <Pressable onPress={remove} style={({ pressed }) => [composerStyles.deleteButton, pressed && composerStyles.pressed]}>
                  <Text style={composerStyles.deleteButtonText}>{isTask ? "Excluir tarefa" : "Excluir meta"}</Text>
                </Pressable>
              )}
              <View style={composerStyles.bottomSpace} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function PriorityButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [composerStyles.segmentButton, selected && composerStyles.segmentButtonSelected, pressed && composerStyles.pressed]}>
      <Text style={[composerStyles.segmentText, selected && composerStyles.segmentTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ColorButton({ color, selected, onPress }: { color: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [composerStyles.colorButton, { backgroundColor: color }, selected && composerStyles.colorSelected, pressed && composerStyles.pressed]} />;
}

const composerStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20, 29, 50, 0.38)" },
  keyboardWrap: { width: "100%" },
  sheet: { backgroundColor: "#FFFFFF", maxHeight: "88%", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 10 },
  grabber: { width: 38, height: 5, borderRadius: 4, backgroundColor: "#D6DAE5", alignSelf: "center", marginBottom: 14 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  eyebrow: { color: "#3B5BDB", fontSize: 10, lineHeight: 15, fontWeight: "800", letterSpacing: 1.1 },
  sheetTitle: { color: "#1D2433", fontSize: 25, lineHeight: 31, fontWeight: "800" },
  closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F2F4F8", alignItems: "center", justifyContent: "center" },
  closeButtonText: { color: "#697386", fontSize: 25, lineHeight: 29, fontWeight: "400" },
  label: { color: "#4B5566", fontSize: 12, lineHeight: 17, fontWeight: "700", marginBottom: 8, marginTop: 16 },
  titleInput: { backgroundColor: "#F6F7FB", borderColor: "#E5E8F0", borderWidth: 1, color: "#1D2433", fontSize: 16, lineHeight: 22, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14 },
  segmented: { flexDirection: "row", backgroundColor: "#F2F4F8", borderRadius: 13, padding: 3, gap: 3 },
  segmentButton: { flex: 1, alignItems: "center", borderRadius: 10, paddingVertical: 10 },
  segmentButtonSelected: { backgroundColor: "#FFFFFF", shadowColor: "#2D3551", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  segmentText: { color: "#697386", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  segmentTextSelected: { color: "#3B5BDB" },
  twoColumns: { flexDirection: "row", gap: 12 },
  fieldColumn: { flex: 1 },
  smallInput: { backgroundColor: "#F6F7FB", borderColor: "#E5E8F0", borderWidth: 1, color: "#1D2433", fontSize: 15, lineHeight: 20, paddingHorizontal: 12, paddingVertical: 13, borderRadius: 14 },
  goalChoices: { gap: 8, paddingBottom: 2 },
  goalChoice: { maxWidth: 160, backgroundColor: "#F2F4F8", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  goalChoiceSelected: { backgroundColor: "#E8ECFF" },
  goalChoiceText: { color: "#697386", fontSize: 13, lineHeight: 17, fontWeight: "700" },
  goalChoiceTextSelected: { color: "#3B5BDB" },
  colorRow: { flexDirection: "row", gap: 14, marginBottom: 12 },
  colorButton: { width: 34, height: 34, borderRadius: 17, borderWidth: 3, borderColor: "#FFFFFF" },
  colorSelected: { outlineStyle: "solid", outlineWidth: 2, outlineColor: "#1D2433" } as any,
  saveButton: { marginTop: 28, backgroundColor: "#3B5BDB", minHeight: 52, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  saveDisabled: { backgroundColor: "#B7C1E8" },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, lineHeight: 22, fontWeight: "800" },
  deleteButton: { alignItems: "center", paddingVertical: 16 },
  deleteButtonText: { color: "#D9485F", fontSize: 14, lineHeight: 19, fontWeight: "800" },
  bottomSpace: { height: 24 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
  loading: { padding: 24 },
});
