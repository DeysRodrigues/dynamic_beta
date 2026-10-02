<div align="center">

# DynaBox

Um painel de produtividade local-first: uma grade de widgets que você arruma do seu jeito, com os dados guardados no seu próprio navegador.

[![No ar](https://img.shields.io/badge/no%20ar-dynabox.space-6a0dad?style=flat-square)](https://dynabox.space)
![React](https://img.shields.io/badge/React-19.1-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.0-646cff?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![Licença](https://img.shields.io/badge/licen%C3%A7a-CC%20BY--NC%204.0-lightgrey?style=flat-square)

[English](README.md) · **Português**

[O que é](#o-que-é) · [Estado](#estado) · [Arquitetura](#arquitetura) · [Stack](#stack) · [Como rodar](#como-rodar) · [Como usar](#como-usar) · [Decisões técnicas](#decisões-técnicas) · [Testes](#testes) · [Licença](#licença)

</div>

---

## O que é

O DynaBox é um painel de página única onde cada funcionalidade é um widget (uma "box") que você
solta numa grade redimensionável. Você escolhe quais widgets aparecem, onde ficam e como tudo
se parece, e o arranjo é seu: não tem conta, não tem servidor e não tem banco de dados. Tudo
mora no `localStorage`, e o único jeito de um dado sair do navegador é você conectar o seu
próprio Google Drive para fazer backup.

Está no ar em **[dynabox.space](https://dynabox.space)**. A interface é em português, porque é
para quem ele foi feito; o código, os commits e este README são em inglês.

## Estado

Medido em 02/10/2026: 299 commits, 97 arquivos TypeScript, 14.644 linhas em `frontend/src`.
`npm run build` e `npm run lint` passam os dois.

| Área | Estado |
|---|---|
| Grade do painel: arrastar, redimensionar, adicionar, remover, múltiplos workspaces | funciona |
| 25 widgets nativos renderizados na grade | funciona |
| Widgets personalizados escritos em HTML, CSS e JS | funciona |
| Motor de temas: 7 paletas, 18 papéis de parede, 10 setups prontos, mais cor livre | funciona |
| Tarefas: entrada por script de texto, edição em lote, isolamento por workspace | funciona |
| Planejador semanal com arrastar e soltar nativo e estatística por ciclo | funciona |
| Projetos: página dedicada e um painel focado em projeto | funciona |
| Wiki (`/wiki`) e página de apresentação (`/intro`) | funciona |
| Backup local: exportar e importar o estado inteiro em JSON | funciona |
| Backup e restauração no Google Drive | funciona, precisa do seu `VITE_GOOGLE_CLIENT_ID` |
| Testes automatizados | ainda não existem |
| Integração contínua | ainda não existe |
| Layout no celular | responsivo, conferido só à mão |

Dois limites que vale dizer de cara. O bundle principal tem **626,99 kB** (184,58 kB com
gzip), porque o código compartilhado de biblioteca ainda não foi separado, mesmo cada widget
sendo um chunk preguiçoso próprio. E não existe suíte de teste, então toda mudança é conferida
compilando e clicando.

## Arquitetura

Um app React, sem backend. O estado mora em stores do Zustand, cada uma persistida no
`localStorage` com a sua própria chave. Nada é buscado no carregamento.

```
componente  ->  store Zustand  ->  localStorage
                      |
                      +---------->  Google Drive (opcional, sob demanda)
```

```
frontend/src
├── pages/              as 8 telas com rota
├── components/
│   ├── layout/         a casca do app: Sidebar, DashboardLayout, Home (a grade em si)
│   │   ├── boxes/      os widgets que moram na grade
│   │   └── modals/     gerenciador de layout, personalização, backup, editor de widget
│   ├── week-planner/   o planejador quebrado em partes memoizadas
│   ├── tasks/          editores de tarefa, em lote e individual
│   ├── landing/        componentes visuais usados pelo /intro
│   └── ui/             primitivos compartilhados: button, TaskItem, CustomDatePicker
├── widgets/            páginas avulsas embutidas por iframe (/w/*)
├── store/              14 stores do Zustand
├── services/           cliente do Google Drive
├── hooks/              useCloudSync, useWeekPlanner
├── utils/              parse de tarefa, helpers de data, helpers de sync
├── data/               catálogo de widget, catálogo de tema, notas de versão no app
└── types/              Task, Project, Theme
```

Rotas:

| Rota | O que é |
|---|---|
| `/` | a grade do painel |
| `/tasks` | lista completa de tarefas, com operações em lote |
| `/projects` | projetos de longo prazo e rotinas |
| `/planner` | planejador semanal, tarefas agrupadas em ciclos |
| `/store` | catálogo de widgets, onde eles são ligados |
| `/themes` | galeria de temas e personalização |
| `/wiki` | referência de sintaxe, atalhos e informação do projeto |
| `/intro` | página de apresentação |
| `/w/snake`, `/w/water`, `/w/bio` | widgets embutíveis que já vêm prontos |
| `/w/custom/:id` | um widget personalizado escrito pelo usuário |

## Stack

| Dependência | Versão | O que faz aqui |
|---|---|---|
| react, react-dom | 19.1 | a interface inteira |
| typescript | 5.8 | tipos, com `tsc -b` dentro do build |
| vite | 7.0 | servidor de desenvolvimento e build |
| tailwindcss | 3.4 | estilo, movido pelas variáveis CSS que o motor de temas escreve |
| zustand | 5.0 | estado global, com os middlewares `persist` e `immer` |
| immer | 10.2 | o rascunho que as duas stores que mexem em widget e layout juntos usam |
| react-grid-layout | 1.5 | a grade que arrasta e redimensiona |
| react-router-dom | 7.6 | roteamento |
| date-fns | 4.1 | conta de data no planejador e nos calendários |
| lucide-react | 0.525 | ícones |
| @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge | | a camada de primitivos no estilo shadcn/ui |
| tailwindcss-animate, tw-animate-css | | as transições |
| eslint, typescript-eslint | 9.x, 8.x | lint |

## Como rodar

```bash
git clone https://github.com/DeysRodrigues/dynamic_beta.git
cd dynamic_beta/frontend
npm install
npm run dev
```

O app abre em `http://localhost:5173` e funciona inteiro offline desde o primeiro carregamento.
Nada precisa de configuração, menos a sincronização com o Google Drive.

### Ligando a sincronização com o Google Drive

A sincronização pede o escopo `drive.file` e escreve um arquivo só,
`dynabox_backup_v1.json`, no seu Drive. É JSON puro, e só a conta que você autorizar consegue
ler. Para usar, você precisa do seu próprio client ID de OAuth no console do Google Cloud:

```bash
cp .env.example .env
# depois preencha o VITE_GOOGLE_CLIENT_ID
```

Sem essa variável o resto do app roda normal, e só os botões de sincronização falham.

### Outros comandos

```bash
npm run build     # tsc -b, depois vite build
npm run lint      # eslint
npm run preview   # serve o build de produção
```

## Como usar

### Os widgets

| Widget | O que faz |
|---|---|
| Tarefas | a lista de tarefas do dia, restrita ao workspace ativo |
| Progresso | quanto do dia já está feito |
| Pomodoro | timer de foco que continua rodando quando você troca de página |
| Bloco de notas | anotação rápida |
| Mini calendário | visão compacta do mês |
| Calendário de presença | controle de presença em evento recorrente |
| Contagem regressiva | quanto falta até uma data |
| Rastreador de hábito | grade de consistência diária |
| Três sapos | as três tarefas mais difíceis do dia |
| Metas mensais | metas do mês |
| Metas de atividade | métrica acumulada por tag, com visão de semana e de mês |
| Meta tags | meta de horas por tag, que alimenta os widgets de progresso |
| Tags | gerenciamento de tag |
| Rastreador de risco | controle de limite, por porcentagem ou contagem absoluta |
| Visão de projetos | estado dos projetos ativos |
| Rastreador de leitura | páginas lidas e progresso do livro |
| Biblioteca | estante visual de coleção |
| Links rápidos | favoritos, organizados em aba |
| Snippet de código | comando e trecho de código guardados |
| Automação | regras simples de se/então |
| Treino rápido | rotina curta de exercício |
| Perfil RPG | XP e nível ganhos com tarefa concluída |
| Jardim de pixels | plantas que crescem conforme a tarefa é concluída |
| Tema | troca de tema de dentro da grade |
| Embutido | um iframe para YouTube, Spotify, Notion ou qualquer URL |

Mais três páginas embutíveis próprias, `snake`, `water` e `bio`, e qualquer widget personalizado
escrito no editor.

### Escrevendo tarefa como texto

Tarefa é digitada, não preenchida em formulário. Uma linha é uma tarefa, e a mesma sintaxe vale
na entrada rápida, na criação em lote e no modal de edição:

```
- revisar o pull request >45min >>14:00 [trabalho] {sprint 12}
- [x] regar as plantas
```

| Token | Significado |
|---|---|
| `>45min` ou `>2h` | quanto tempo leva |
| `>>14:00` | a que hora acontece |
| `[tag]` | a tag, que é o que o controle de meta conta |
| `{grupo}` | o ciclo ou grupo a que pertence |
| `- [x]` | já feita |

## Decisões técnicas

**Local-first, com o `localStorage` como fonte da verdade.** Não tem backend nem conta. Isso
deixa o app instantâneo e privado por padrão, e é o motivo de o modelo de dados ter que ser
pequeno o bastante para serializar inteiro. O custo é que nada sincroniza entre dispositivos
sozinho, e é justamente o buraco que o backup opcional no Drive fecha.

**Zustand em vez de Context.** O app começou em provider de Context e saiu deles na 0.2.0. O
motivo foi concreto: com o Pomodoro batendo a cada segundo, um único context no topo da árvore
re-renderizava a sidebar e o cabeçalho a cada segundo. Catorze stores pequenas com seletores
`useShallow` fazem com que um tique encoste só no timer.

**Um chunk por widget.** Cada box é carregada com `React.lazy` atrás de um fallback de
`Suspense`, então o build emite um arquivo separado por widget e um painel baixa só os widgets
que o layout dele realmente usa.

**Tema como variável CSS injetada, não uma classe por tema.** Um aplicador só escreve as
variáveis no `:root`. É por isso que a galeria inteira mais qualquer cor que o usuário inventar
não custa CSS nenhum a mais, e por isso que a troca de cor é pré-visualizada ao vivo em vez de
depois de recarregar.

**Widget personalizado roda dentro de uma rota em iframe.** O HTML, CSS e JS escrito pelo
usuário é servido em `/w/custom/:id` e embutido, então não alcança o estado nem o estilo do app.
Os três widgets embutíveis que já vêm prontos usam o mesmo mecanismo, o que significa um caminho
para manter em vez de dois.

**Tarefa como script de texto.** Digitar `>45min [trabalho]` é mais rápido que quatro campos de
formulário, e manter um parser só (`TaskParser.ts`) para criação, entrada em lote e edição
garante que os três caminhos não desandem cada um para um lado.

**Immer só onde o estado é aninhado.** Duas stores usam, a `useDashboardStore` e a
`useProjectStore`, porque as duas atualizam o array de widget e o array de layout juntos e
precisam ser atômicas. As outras doze são planas o bastante para que a atualização direta leia
melhor.

## Testes

Ainda não existe suíte de teste automatizado. O que é conferido hoje:

```bash
npm run build     # tsc -b mais vite build, passando
npm run lint      # eslint, limpo
```

O resto é conferido à mão: a volta completa da sincronização (fazer backup num navegador e
restaurar em outro), a persistência do layout depois de recarregar, e os widgets de gamificação
reagindo a uma tarefa concluída. O [`FEATURES.md`](FEATURES.md) documenta o sistema widget por
widget.

## Licença

[Creative Commons Attribution-NonCommercial 4.0 International](LICENSE). Use e adapte à
vontade, com crédito, mas não comercialmente.
