import { describe, expect, it } from "vitest";

import { formatWeeklyDays, getGoalProgress, getTaskStats, getTodayKey, getWeeklyOccurrenceDates } from "../lib/productivity-utils";

describe("utilitários de produtividade", () => {
  it("gera uma chave local de data estável", () => {
    expect(getTodayKey(new Date(2026, 7, 18))).toBe("2026-08-18");
  });

  it("calcula o progresso somente das tarefas do dia selecionado", () => {
    const stats = getTaskStats([
      { id: "1", title: "A", completed: true, priority: "alta", date: "2026-08-18", createdAt: "" },
      { id: "2", title: "B", completed: false, priority: "média", date: "2026-08-18", time: "09:00", createdAt: "" },
      { id: "3", title: "C", completed: true, priority: "baixa", date: "2026-08-19", createdAt: "" },
    ], "2026-08-18");
    expect(stats).toEqual({ total: 2, completed: 1, planned: 1, completionRatio: 0.5 });
  });

  it("limita o progresso de uma meta ao intervalo de zero a cem", () => {
    expect(getGoalProgress({ id: "goal", title: "Ler", unit: "páginas", currentValue: 150, targetValue: 100, color: "#3B5BDB", createdAt: "" })).toBe(100);
  });

  it("gera as ocorrências dos dias selecionados nos próximos oito ciclos semanais", () => {
    const dates = getWeeklyOccurrenceDates("2026-08-17", [1, 3]);
    expect(dates).toHaveLength(16);
    expect(dates.slice(0, 4)).toEqual(["2026-08-17", "2026-08-19", "2026-08-24", "2026-08-26"]);
    expect(dates.at(-1)).toBe("2026-10-07");
  });

  it("resume os dias de recorrência semanal para a interface", () => {
    expect(formatWeeklyDays([1, 3, 5])).toBe("Seg, Qua, Sex");
    expect(formatWeeklyDays([0, 1, 2, 3, 4, 5, 6])).toBe("todos os dias");
  });
});
