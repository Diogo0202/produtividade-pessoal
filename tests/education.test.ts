import { describe, expect, it } from "vitest";

import { createStudent, defaultExplanation, EDUCATION_EVENTS } from "../lib/education";

describe("domínio educacional", () => {
  it("cria um aluno com identificador e dados informados", () => {
    const student = createStudent("Lia Alves", "lia@colegio.edu.br", "Ensino Médio");
    expect(student.name).toBe("Lia Alves");
    expect(student.email).toBe("lia@colegio.edu.br");
    expect(student.level).toBe("Ensino Médio");
    expect(student.id).toMatch(/^student-/);
  });

  it("adapta a explicação do evento aos níveis educacionais", () => {
    const event = EDUCATION_EVENTS[0];
    expect(defaultExplanation(event, "leigo")).toContain("ponto principal");
    expect(defaultExplanation(event, "técnico")).toContain("variáveis");
    expect(defaultExplanation(event, "acadêmico")).toContain("dinâmica atmosférica");
  });
});
