export type TaskPriority = "alta" | "média" | "baixa";

export type ProductivityTask = {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  date?: string;
  time?: string;
  duration?: number;
  goalId?: string;
  createdAt: string;
};

export type ProductivityGoal = {
  id: string;
  title: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  deadline?: string;
  color: string;
  createdAt: string;
};

export type TaskStats = {
  total: number;
  completed: number;
  planned: number;
  completionRatio: number;
};

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromKey(key: string) {
  return new Date(`${key}T12:00:00`);
}

export function formatLongDate(key: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dateFromKey(key));
}

export function formatShortDate(key: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(dateFromKey(key))
    .replace(".", "");
}

export function getWeekDays(baseDate = new Date()) {
  const day = baseDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    return {
      key: getTodayKey(current),
      label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(current)
        .replace(".", "")
        .slice(0, 3),
      day: current.getDate(),
    };
  });
}

export function getTaskStats(tasks: ProductivityTask[], date?: string): TaskStats {
  const scopedTasks = date ? tasks.filter((task) => task.date === date) : tasks;
  const total = scopedTasks.length;
  const completed = scopedTasks.filter((task) => task.completed).length;
  const planned = scopedTasks.filter((task) => Boolean(task.time)).length;
  return {
    total,
    completed,
    planned,
    completionRatio: total ? completed / total : 0,
  };
}

export function getGoalProgress(goal: ProductivityGoal) {
  if (goal.targetValue <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100)));
}

export function priorityLabel(priority: TaskPriority) {
  return priority === "alta" ? "Alta" : priority === "média" ? "Média" : "Baixa";
}

export function priorityColor(priority: TaskPriority) {
  return priority === "alta" ? "#D9485F" : priority === "média" ? "#E58C33" : "#3B5BDB";
}
