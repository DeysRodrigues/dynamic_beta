import { Code2, Snowflake, Cat, Flame } from "lucide-react";
import type { SetupItem } from "@/types/Theme";
import { packLayouts } from "@/utils/layout";
import type { NotepadContent } from "@/widgets/schemas/notepad";
import type { SnippetContent } from "@/widgets/schemas/snippet";
import type { QuickLinksContent } from "@/widgets/schemas/quicklinks";
import type { BookTrackerContent } from "@/widgets/schemas/books";
import type { LibraryContent } from "@/widgets/schemas/library";

// =====================================================================
// READY-MADE SETUPS
//
// A setup is a theme, a set of widgets already sized and placed, and the content that makes each
// widget useful from the first second. Each one is described by what its widgets are and how big
// they are; `defineSetup` gives the boxes their ids and `packLayouts` places them with no overlap
// on every breakpoint.
//
// Task lists are not part of a setup: tasks live in their own store, which a setup never touches.
// =====================================================================

interface SetupBox {
  /** The widget type, as in the widget registry. */
  type: string;
  /** Width in columns (the grid has 4) and height in rows. */
  w: number;
  h: number;
  /** What the widget starts with. Widgets without content start empty. */
  content?: unknown;
}

interface SetupDefinition extends Omit<SetupItem, "boxes" | "layouts" | "content"> {
  /** Short word that goes into every box id of this setup, e.g. `dev` -> `notepad-dev`. */
  slug: string;
  widgets: SetupBox[];
}

function defineSetup({ slug, widgets, ...setup }: SetupDefinition): SetupItem {
  const seen: Record<string, number> = {};
  const boxes = widgets.map((box) => {
    seen[box.type] = (seen[box.type] ?? 0) + 1;
    return { ...box, id: seen[box.type] === 1 ? `${box.type}-${slug}` : `${box.type}-${slug}-${seen[box.type]}` };
  });

  const content: Record<string, unknown> = {};
  for (const box of boxes) if (box.content !== undefined) content[box.id] = box.content;

  return {
    ...setup,
    boxes: boxes.map((box) => box.id),
    layouts: packLayouts(boxes.map(({ id, w, h }) => ({ id, w, h }))),
    content,
  };
}

/** A local date-time `days` from now at `hour`:00, in the format the countdown widget saves. */
function inDays(days: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}

const LOFI_STREAM = "https://www.youtube.com/embed/jfKfPfyJRdk";
const thirtyDays = () => Array(30).fill(false) as boolean[];

// ---------------------------------------------------------------------
// 1. DEV WORKSTATION
// ---------------------------------------------------------------------
const devNotes = {
  view: "preview",
  text: `# 🧑‍💻 Hoje

- [ ] Revisar o PR que está aberto
- [ ] Escrever o teste que faltou
- [ ] Commits pequenos e descritivos

## Bugs
- [ ] Reproduzir antes de mexer
- [ ] Achar a causa, não só o sintoma

## Ideias
- Automatizar o deploy
- Documentar o setup do projeto

> Código que funciona hoje vale mais que código perfeito que nunca sai.`,
} satisfies NotepadContent;

const devSnippets = {
  snippets: [
    { id: "g1", type: "git", title: "Desfazer o último commit (mantém as mudanças)", code: "git reset --soft HEAD~1" },
    { id: "g2", type: "git", title: "Guardar o trabalho sem commitar", code: 'git stash push -m "wip"\ngit stash pop' },
    { id: "g3", type: "git", title: "Histórico em árvore", code: "git log --oneline --graph --decorate -20" },
    { id: "g4", type: "git", title: "Nova branch a partir da main", code: "git switch -c feat/nome main" },
    { id: "g5", type: "git", title: "Apagar branches já mergeadas", code: "git branch --merged | grep -v main | xargs git branch -d" },
    { id: "d1", type: "docker", title: "Subir e reconstruir", code: "docker compose up -d --build" },
    { id: "d2", type: "docker", title: "Acompanhar os logs", code: "docker logs -f --tail 100 <container>" },
    { id: "d3", type: "docker", title: "Containers em tabela", code: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"' },
    { id: "s1", type: "shell", title: "Quem está usando a porta", code: "lsof -i :3000" },
    { id: "s2", type: "shell", title: "Maiores arquivos da pasta", code: "du -ah . | sort -rh | head -20" },
    { id: "q1", type: "sql", title: "Achar duplicados", code: "SELECT email, COUNT(*)\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;" },
    { id: "t1", type: "ts", title: "Tipo que aceita nulo", code: "type Nullable<T> = T | null;" },
    { id: "j1", type: "js", title: "Debounce", code: "const debounce = (fn, ms = 300) => {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n};" },
    { id: "c1", type: "css", title: "Centralizar com grid", code: "display: grid;\nplace-items: center;" },
  ],
} satisfies SnippetContent;

const devLinks = {
  viewMode: "list",
  categories: [
    {
      id: "docs",
      name: "Docs",
      links: [
        { id: "l1", title: "MDN", url: "https://developer.mozilla.org" },
        { id: "l2", title: "DevDocs", url: "https://devdocs.io" },
        { id: "l3", title: "React", url: "https://react.dev" },
        { id: "l4", title: "TypeScript", url: "https://www.typescriptlang.org/docs" },
        { id: "l5", title: "Tailwind", url: "https://tailwindcss.com/docs" },
      ],
    },
    {
      id: "tools",
      name: "Ferramentas",
      links: [
        { id: "l6", title: "GitHub", url: "https://github.com" },
        { id: "l7", title: "Regex101", url: "https://regex101.com" },
        { id: "l8", title: "Can I use", url: "https://caniuse.com" },
        { id: "l9", title: "Excalidraw", url: "https://excalidraw.com" },
        { id: "l10", title: "JSON Crack", url: "https://jsoncrack.com" },
      ],
    },
    {
      id: "learn",
      name: "Aprender",
      links: [
        { id: "l11", title: "roadmap.sh", url: "https://roadmap.sh" },
        { id: "l12", title: "freeCodeCamp", url: "https://www.freecodecamp.org" },
        { id: "l13", title: "The Odin Project", url: "https://www.theodinproject.com" },
        { id: "l14", title: "Exercism", url: "https://exercism.org" },
        { id: "l15", title: "Stack Overflow", url: "https://stackoverflow.com" },
      ],
    },
  ],
} satisfies QuickLinksContent;

// ---------------------------------------------------------------------
// 2. STUDY: FOCUS
// ---------------------------------------------------------------------
const studyPlan = {
  view: "preview",
  text: `# 📚 Plano de estudo

**Meta da semana:** ______

## Roteiro do dia
- [ ] 25 min na matéria principal
- [ ] 25 min de exercícios
- [ ] 10 min revisando o que errei

## Revisão espaçada
| Quando | O quê |
|---|---|
| Hoje | resumir com as minhas palavras |
| Em 1 dia | refazer o que errei |
| Em 7 dias | testar sem consultar |

> Dúvida no meio? Anote aqui e siga. Pesquisar agora quebra o foco.`,
} satisfies NotepadContent;

// ---------------------------------------------------------------------
// 3. STUDY: RELAX
// ---------------------------------------------------------------------
const readingNotes = {
  view: "preview",
  text: `# 📖 Notas de leitura

**Livro:** ______  **Capítulo:** ______

## Ideias que ficaram
- 

## Citações
> "..."

## Para praticar
- [ ] Um exercício pequeno sobre o capítulo`,
} satisfies NotepadContent;

const readingBooks = {
  settings: { pageStep: 10 },
  books: [
    { id: "b1", title: "Código Limpo", current: 120, total: 464, color: "bg-emerald-500" },
    { id: "b2", title: "O Programador Pragmático", current: 45, total: 352, color: "bg-blue-500" },
  ],
} satisfies BookTrackerContent;

const readingShelf = {
  settings: { woodColor: "#0f172a", wallColor: "transparent" },
  categories: [
    { id: "1", name: "Geral", icon: "library", color: "var(--book-color-1)" },
    { id: "2", name: "Estudo", icon: "school", color: "var(--book-color-2)" },
  ],
  books: [
    { id: "s1", title: "Código Limpo", categoryId: "2", completed: false, color: "#0e7490", height: 46, pattern: 0 },
    { id: "s2", title: "O Programador Pragmático", categoryId: "2", completed: false, color: "#7c3aed", height: 42, pattern: 1 },
    { id: "s3", title: "Algoritmos: Teoria e Prática", categoryId: "2", completed: true, color: "#be185d", height: 50, pattern: 2 },
    { id: "s4", title: "Harry Potter", categoryId: "1", completed: true, color: "#b45309", height: 40, pattern: 0 },
  ],
} satisfies LibraryContent;

// ---------------------------------------------------------------------
// 4. EXAM WEEK
// ---------------------------------------------------------------------
const examChecklist = {
  view: "preview",
  text: `# 🔥 Semana de provas

## Checklist de revisão
- [ ] Listar tudo o que cai na prova
- [ ] Resolver provas de anos anteriores
- [ ] Resumo de uma página por matéria
- [ ] Dormir bem na véspera

## Ordem de prioridade
1. A matéria com a prova mais próxima
2. A matéria em que tenho mais dúvida
3. O resto

**Regra:** 50 minutos de estudo, 10 de pausa.`,
} satisfies NotepadContent;

export const readySetups: SetupItem[] = [
  defineSetup({
    id: "setup-dev",
    slug: "dev",
    name: "Dev Workstation",
    description: "Tarefas, snippets de git, docker e SQL, links de docs e ferramentas, notas em markdown, pomodoro e lo-fi.",
    theme: {
      backgroundColor: "#282a36",
      boxColor: "#44475a",
      sidebarColor: "#282a36",
      textColor: "#f8f8f2",
      primaryColor: "#bd93f9",
      boxOpacity: 1,
      wallpaper: "plain",
      customImage: null,
    },
    icon: <Code2 size={24} />,
    color: "bg-purple-600",
    widgets: [
      { type: "tasks", w: 2, h: 6 },
      { type: "snippet", w: 2, h: 6, content: devSnippets },
      { type: "pomodoro", w: 1, h: 4 },
      { type: "quicklinks", w: 1, h: 4, content: devLinks },
      { type: "notepad", w: 2, h: 4, content: devNotes },
      { type: "habit", w: 1, h: 3, content: { habitName: "Codar todo dia", checkedDates: [] } },
      { type: "progress", w: 1, h: 3 },
      { type: "embedded", w: 2, h: 3, content: { url: LOFI_STREAM, mode: "video", isLocked: true } },
    ],
  }),

  defineSetup({
    id: "setup-study-focus",
    slug: "focus",
    name: "Estudo: Foco Total",
    description: "Tudo para uma sessão sem distração: tarefas, pomodoro, os 3 sapos do dia, plano de estudo e metas de 30 dias.",
    theme: {
      backgroundColor: "#2e3440",
      boxColor: "#3b4252",
      sidebarColor: "#242933",
      textColor: "#d8dee9",
      primaryColor: "#88c0d0",
      boxOpacity: 1,
      wallpaper: "plain",
      customImage: null,
    },
    icon: <Snowflake size={24} />,
    color: "bg-cyan-600",
    widgets: [
      { type: "tasks", w: 2, h: 6 },
      { type: "pomodoro", w: 1, h: 3 },
      { type: "three_frogs", w: 1, h: 3 },
      { type: "progress", w: 1, h: 3 },
      { type: "calendar", w: 1, h: 3 },
      { type: "notepad", w: 2, h: 5, content: studyPlan },
      {
        type: "goals",
        w: 2,
        h: 5,
        content: {
          goals: [
            { id: "g1", title: "Estudar 1h por dia", checks: thirtyDays() },
            { id: "g2", title: "Revisar as anotações", checks: thirtyDays() },
            { id: "g3", title: "Dormir antes da meia-noite", checks: thirtyDays() },
          ],
        },
      },
    ],
  }),

  defineSetup({
    id: "setup-study-relax",
    slug: "relax",
    name: "Estudo Relax: Lo-fi e Livros",
    description: "Estudar sem pressa: lo-fi tocando, pomodoro, jardim, livros em andamento, estante e notas de leitura.",
    theme: {
      backgroundColor: "#041518",
      boxColor: "#0f2e2e",
      sidebarColor: "#021214",
      textColor: "#ccfbf1",
      primaryColor: "#2dd4bf",
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/cozy-cat.png",
    },
    icon: <Cat size={24} />,
    color: "bg-teal-700",
    widgets: [
      { type: "embedded", w: 2, h: 4, content: { url: LOFI_STREAM, mode: "video", isLocked: true } },
      { type: "pomodoro", w: 1, h: 4 },
      { type: "garden", w: 1, h: 4 },
      { type: "books", w: 2, h: 4, content: readingBooks },
      { type: "library", w: 2, h: 4, content: readingShelf },
      { type: "notepad", w: 3, h: 3, content: readingNotes },
      { type: "habit", w: 1, h: 3, content: { habitName: "Ler 20 minutos", checkedDates: [] } },
    ],
  }),

  defineSetup({
    id: "setup-exams",
    slug: "exams",
    name: "Semana de Provas",
    description: "Contagem regressiva das provas, controle de faltas, tarefas, pomodoro, checklist de revisão e metas.",
    theme: {
      backgroundColor: "#0f172a",
      boxColor: "#312e81",
      sidebarColor: "#1e1b4b",
      textColor: "#ffedd5",
      primaryColor: "#fb923c",
      boxOpacity: 0.85,
      wallpaper: "custom",
      customImage: "/images-themes/hallow-cat.png",
    },
    icon: <Flame size={24} />,
    color: "bg-orange-600",
    widgets: [
      { type: "tasks", w: 2, h: 6 },
      { type: "countdown", w: 1, h: 3, content: { eventName: "Prova 1", targetDate: inDays(5, 8) } },
      { type: "countdown", w: 1, h: 3, content: { eventName: "Prova 2", targetDate: inDays(9, 8) } },
      { type: "pomodoro", w: 1, h: 3 },
      {
        type: "risk",
        w: 1,
        h: 3,
        content: {
          items: [{ id: "r1", title: "Faltas: matéria A", total: 60, limit: 15, current: 3, consequence: "Reprovação por falta" }],
        },
      },
      { type: "notepad", w: 2, h: 4, content: examChecklist },
      {
        type: "goals",
        w: 2,
        h: 4,
        content: {
          goals: [
            { id: "g1", title: "Resolver 10 questões", checks: thirtyDays() },
            { id: "g2", title: "Revisar o resumo", checks: thirtyDays() },
            { id: "g3", title: "Dormir 7 horas", checks: thirtyDays() },
          ],
        },
      },
    ],
  }),
];
