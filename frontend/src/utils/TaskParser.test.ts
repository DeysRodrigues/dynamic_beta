import { describe, it, expect } from "vitest";
import { formatTaskToText, parseTextToTaskData } from "./TaskParser";
import type { Task } from "@/types/Task";

const baseTask: Task = {
  id: "1",
  description: "Estudar React",
  tag: "",
  completed: false,
  date: "2026-01-01",
  duration: 0,
};

describe("parseTextToTaskData", () => {
  it("usa 15 minutos quando não há duração", () => {
    expect(parseTextToTaskData("- Lavar louça").duration).toBe(15);
  });

  it("lê duração em minutos, com 'min' tendo prioridade sobre 'm'", () => {
    expect(parseTextToTaskData("- Ler >45min").duration).toBe(45);
    expect(parseTextToTaskData("- Ler >45m").duration).toBe(45);
    expect(parseTextToTaskData("- Ler >45min").description).toBe("Ler");
  });

  it("lê duração em horas", () => {
    expect(parseTextToTaskData("- Ler >2h").duration).toBe(120);
  });

  it("lê o horário e completa com zero à esquerda", () => {
    expect(parseTextToTaskData("- Reunião >>14:00").time).toBe("14:00");
    expect(parseTextToTaskData("- Reunião >> 9:30").time).toBe("09:30");
  });

  it("não confunde horário com duração", () => {
    const r = parseTextToTaskData("- Reunião >>14:00");
    expect(r.duration).toBe(15);
    expect(r.description).toBe("Reunião");
  });

  it("lê tag e grupo", () => {
    const r = parseTextToTaskData("- Estudar [faculdade] {ciclo 1}");
    expect(r.tag).toBe("faculdade");
    expect(r.groupTag).toBe("ciclo 1");
    expect(r.description).toBe("Estudar");
  });

  it("reconhece tarefa concluída", () => {
    expect(parseTextToTaskData("- [x] Feito").completed).toBe(true);
    expect(parseTextToTaskData("- [x] Feito").description).toBe("Feito");
    expect(parseTextToTaskData("- [ ] Pendente").completed).toBe(false);
  });

  it("modo '+': cada + vale uma hora", () => {
    expect(parseTextToTaskData("++ Projeto").duration).toBe(120);
  });

  it("combina todos os campos", () => {
    expect(parseTextToTaskData("- [x] Estudar >1h >>08:00 [uni] {c1}")).toEqual({
      description: "Estudar",
      time: "08:00",
      duration: 60,
      tag: "uni",
      groupTag: "c1",
      completed: true,
    });
  });
});

describe("formatTaskToText", () => {
  it("escreve horas quando a duração é múltipla de 60", () => {
    expect(formatTaskToText({ ...baseTask, duration: 120 })).toBe("- Estudar React >2h");
  });

  it("escreve minutos nos demais casos", () => {
    expect(formatTaskToText({ ...baseTask, duration: 45 })).toBe("- Estudar React >45min");
  });

  it("marca concluída com - [x]", () => {
    expect(formatTaskToText({ ...baseTask, completed: true })).toBe("- [x] Estudar React");
  });

  it("omite campos vazios", () => {
    expect(formatTaskToText(baseTask)).toBe("- Estudar React");
  });
});

describe("ida e volta (format -> parse)", () => {
  it.each([
    { duration: 45, time: "14:00", tag: "uni", groupTag: "c1", completed: false },
    { duration: 120, time: undefined, tag: "", groupTag: undefined, completed: true },
    { duration: 90, time: "09:05", tag: "casa", groupTag: undefined, completed: false },
  ])("preserva os campos %#", (fields) => {
    const task: Task = { ...baseTask, ...fields };
    const parsed = parseTextToTaskData(formatTaskToText(task));
    expect(parsed.description).toBe(task.description);
    expect(parsed.duration).toBe(task.duration);
    expect(parsed.time).toBe(task.time);
    expect(parsed.tag).toBe(task.tag);
    expect(parsed.groupTag).toBe(task.groupTag ?? "");
    expect(parsed.completed).toBe(task.completed);
  });
});
