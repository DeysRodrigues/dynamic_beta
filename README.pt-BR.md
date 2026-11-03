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

[O que é](#o-que-é) · [Estado](#estado) · [Arquitetura](#arquitetura) · [Stack](#stack) · [Dois jeitos de rodar](#dois-jeitos-de-rodar) · [Como usar](#como-usar) · [Decisões técnicas](#decisões-técnicas) · [Testes](#testes) · [Licença](#licença)

</div>

---

## O que é

O DynaBox é um painel de página única onde cada funcionalidade é um widget (uma "box") que você
solta numa grade redimensionável. Você escolhe quais widgets aparecem, onde ficam e como tudo
se parece, e o arranjo é seu. Por padrão não tem conta, não tem servidor e não tem banco de
dados: tudo mora no `localStorage`, e o dado só sai do navegador se você mesma exportar um
backup em JSON. Se quiser uma conta e uma cópia dos dados num banco (para usar em mais de um
aparelho), dá para conectar o app a um servidor DynaBox que você mesma liga com Docker. Os dois
jeitos estão em [Dois jeitos de rodar](#dois-jeitos-de-rodar).

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
| Motor de temas: 7 paletas, 18 papéis de parede, 4 setups prontos (dev, estudo focado, estudo relax, semana de provas), mais cor livre | funciona |
| Tarefas: entrada por script de texto, edição em lote, isolamento por workspace | funciona |
| Planejador semanal com arrastar e soltar nativo e estatística por ciclo | funciona |
| Projetos: página dedicada e um painel focado em projeto | funciona |
| Wiki (`/wiki`) e página de apresentação (`/intro`) | funciona |
| Backup local: exportar e importar o estado inteiro em JSON | funciona |
| Conta e sincronização opcionais com um servidor seu (PostgreSQL), escolhidas dentro do app | funciona; a tela só foi exercitada por testes automatizados até agora |
| Docker: um comando para o app, a API e o banco | funciona, conferido na CI por um smoke test |
| Testes automatizados | 480 no app (motor de sincronização, tela de conta, armazenamento lento e com falha, markdown, stores, migrações, testes de render) e 77 no servidor, que rodam contra um PostgreSQL de verdade |
| Integração contínua | GitHub Actions: lint, build e teste a cada push e PR |
| Layout no celular | responsivo, conferido só à mão |

Um limite que vale dizer de cara: a suíte de teste é nova. Ela cobre a lógica pura, as stores e
o render das telas principais, mas não o arrastar e soltar da grade nem o comportamento interno
da maioria dos widgets. O chunk do app tem **242 kB** (64,6 kB com gzip); as bibliotecas estão
separadas em seis chunks de vendor (react, router, grid, icons, dates, zod) e cada widget é um
chunk preguiçoso próprio.

## Arquitetura

Um app React, mais um servidor opcional. O estado mora em stores do Zustand, cada uma persistida
no `localStorage` com a sua própria chave, e nada é buscado no carregamento. Entrar num servidor
não muda isso: o app continua lendo e gravando no `localStorage`, e um motor de sincronização
copia para o servidor e de volta.

```
só local:   componente -> store Zustand -> localStorage

com servidor:  componente -> store Zustand -> localStorage <-> motor de sync <-> API -> PostgreSQL
```

```
dynamic_beta/
├── frontend/           o app React (+ Dockerfile e nginx.conf)
├── backend/            a API: Fastify, Drizzle, PostgreSQL, argon2 + JWT
├── docker-compose.yml  web + api + db, um comando
└── scripts/            smoke test, miniaturas dos temas
```

```
frontend/src
├── pages/              as 8 telas com rota
├── components/
│   ├── layout/         a casca do app: DashboardLayout, gerenciadores de tema e de pomodoro
│   │   ├── boxes/      os widgets que moram na grade
│   │   └── modals/     gerenciador de layout, personalização, backup, editor de widget
│   ├── week-planner/   o planejador quebrado em partes memoizadas
│   ├── tasks/          editores de tarefa, em lote e individual
│   ├── landing/        componentes visuais usados pelo /intro
│   └── ui/             primitivos compartilhados: button, TaskItem, CustomDatePicker
├── features/
│   ├── dashboard/      a página da grade: cabeçalho, abas de workspace, menu de adicionar, grade, moldura do box
│   └── sidebar/        a barra lateral: perfil, navegação, painel de ajustes
├── widgets/            o registro de widgets (boxes/<id>.tsx) e as páginas de iframe (/w/*)
├── store/              14 stores do Zustand
├── persistence/        o registro das chaves salvas, o adaptador de armazenamento, migrações, backup e hidratação
├── sync/               a conexão opcional com o servidor: sessão, cliente da API, motor de sincronização
├── hooks/              useWeekPlanner
├── utils/              parse de tarefa, helpers de data
├── data/               catálogo de tema, lista de widgets de iframe, notas de versão no app
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
| zod | 4.6 | o formato do que os widgets mais pesados salvam, conferido a cada leitura e escrita |
| immer | 10.2 | o rascunho que as duas stores que mexem em widget e layout juntos usam |
| react-markdown, remark-gfm | 10, 4 | a visualização em markdown do bloco de notas, no estilo do GitHub, sem HTML cru |
| react-grid-layout | 1.5 | a grade que arrasta e redimensiona |
| react-router-dom | 7.6 | roteamento |
| date-fns | 4.1 | conta de data no planejador e nos calendários |
| lucide-react | 0.525 | ícones |
| @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge | | a camada de primitivos no estilo shadcn/ui |
| tailwindcss-animate, tw-animate-css | | as transições |
| eslint, typescript-eslint | 9.x, 8.x | lint |

O servidor opcional em `backend/` (detalhes em [`backend/README.md`](backend/README.md)):

| Dependência | O que faz lá |
|---|---|
| Fastify 5 + Zod 4 | o servidor HTTP e a validação de cada requisição |
| Drizzle ORM + postgres.js | SQL tipado; as migrações são arquivos `.sql` simples em `backend/drizzle/` |
| PostgreSQL 17 | o banco; um documento `jsonb` por usuário e chave |
| @node-rs/argon2 | hash de senha (argon2id) |
| @fastify/jwt, cors, rate-limit | tokens de login, os sites permitidos e limite de tentativas de entrada |
| Vitest + Testcontainers | testes contra um PostgreSQL de verdade, subido no Docker |

## Dois jeitos de rodar

O app é o mesmo nos dois. A diferença é só se um servidor guarda uma cópia dos seus dados.

### 1. Só local (o padrão)

```bash
git clone https://github.com/DeysRodrigues/dynamic_beta.git
cd dynamic_beta/frontend
npm install
npm run dev
```

O app abre em `http://localhost:5173` e funciona inteiro offline desde o primeiro carregamento.
Nada precisa de configuração, não tem conta, e os dados ficam neste navegador. É também o que o
site publicado faz.

### 2. Com conta e banco de dados (Docker)

```bash
git clone https://github.com/DeysRodrigues/dynamic_beta.git
cd dynamic_beta
cp .env.example .env        # depois preencha JWT_SECRET e POSTGRES_PASSWORD nele
openssl rand -hex 32        # um valor para o JWT_SECRET
openssl rand -hex 16        # um valor para o POSTGRES_PASSWORD
docker compose up --build -d
```

Abra `http://localhost:8080`, vá em **Conta** no menu e crie uma conta. O app que está nesse
container já aponta para o servidor dele. Rodam três containers:

| Serviço | O que é | Dá para acessar da sua máquina? |
|---|---|---|
| `web` | o app, servido pelo nginx; ele repassa `/api` para a API | sim, na porta 8080 (`WEB_PORT`) |
| `api` | o servidor (Fastify) | não, só pelo `web` |
| `db` | PostgreSQL 17, dados no volume `dynabox_pgdata` | não |

```bash
docker compose logs -f api    # acompanhar o servidor
docker compose down           # parar; os dados ficam no volume
docker compose down -v        # parar E apagar o banco
./scripts/smoke.sh            # conferir um servidor ligado de ponta a ponta (só precisa de curl)
```

Depois de criar a sua conta, coloque `ALLOW_REGISTRATION=false` no `.env` e rode
`docker compose up -d` de novo, para ninguém mais criar conta. Para alcançar a API ou o banco
com ferramentas como curl ou psql enquanto desenvolve, acrescente `-f docker-compose.dev.yml`
(API em `127.0.0.1:3000`, banco em `127.0.0.1:5433`).

Tudo sobre essa opção (variáveis do `.env`, backup, atualização, servidor na nuvem, problemas
comuns) está em **[docs/DOCKER.pt-BR.md](docs/DOCKER.pt-BR.md)**.

### Usando o site publicado com o seu servidor

O site publicado começa só local. Para sincronizá-lo com um servidor que você mesma roda:

1. Ligue o servidor como acima e ponha o endereço do site no `.env`, para o servidor aceitá-lo:
   `CORS_ORIGINS=https://dynabox.space`, e rode `docker compose up -d`.
2. No site, abra **Conta**, digite `http://localhost:8080` (o app acha o `/api` sozinho), aperte
   **Testar conexão** e entre ou crie a conta.

O mesmo passo a passo para ligar o seu servidor está na Wiki do app, na seção "Ter o seu
servidor" (`/wiki?secao=server`), e a página Conta tem um link para ela.

Os navegadores deixam uma página https chamar `http://localhost`, mas o Safari não deixa, e um
servidor em outra máquina precisa de endereço https próprio. Nesses casos use o app servido pelo
seu Docker (opção 2). A tela detecta o problema e avisa antes de tentar.

### Como a sincronização se comporta

O armazenamento do navegador continua sendo a fonte da verdade, então o app é instantâneo e
funciona offline. Depois que você muda algo, o motor envia um instante depois, dizendo qual
revisão viu por último, para o servidor poder recusar uma escrita velha. As novidades de outros
aparelhos chegam ao voltar para a aba, quando a rede volta e a cada minuto. Se a mesma coisa
mudou nos dois lugares, o app pergunta qual versão manter, chave por chave; ele não consegue
mesclar duas versões e nunca sobrescreve antes de você responder. **Sair** volta ao modo só
local sem apagar nada.

### Notas de segurança

As senhas ficam guardadas como hash argon2id. Os tokens de login são assinados com o
`JWT_SECRET`, duram duas semanas e ficam no armazenamento do navegador, então um script
injetado na página poderia ler um (hoje não existe, mas é a troca que se faz). Entrar e criar
conta têm limite de tentativas. Num servidor aberto na internet, ponha-o atrás de https, ajuste
o `CORS_ORIGINS` para o seu site e desligue o `ALLOW_REGISTRATION` quando tiver a sua conta. Não
há recuperação de senha por e-mail nem botão para apagar a conta em si ainda, só os dados salvos.

### Outros comandos

```bash
npm run build     # tsc -b, depois vite build
npm run lint      # eslint
npm run preview   # serve o build de produção
./scripts/make-theme-thumbs.sh   # miniaturas WebP leves dos papéis de parede dos temas (precisa do ImageMagick)
```

A página de temas mostra miniaturas WebP pequenas em vez dos papéis de parede inteiros; a imagem
completa só é carregada quando um tema é aplicado. Depois de adicionar ou trocar um papel de
parede em `public/images-themes/`, rode o script e commite as miniaturas novas. Um teste falha
se um tema apontar para um papel de parede sem miniatura.

## Como usar

### Os widgets

| Widget | O que faz |
|---|---|
| Tarefas | a lista de tarefas do dia, restrita ao workspace ativo |
| Progresso | quanto do dia já está feito |
| Pomodoro | timer de foco que continua rodando quando você troca de página |
| Bloco de notas | anotação rápida, escrita em markdown, com visualização e checklist clicável |
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
| Jardim de pixels | uma planta em pixel art que cresce em cinco estágios conforme as tarefas de hoje são concluídas |
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

**Local-first, com o `localStorage` como fonte da verdade.** Por padrão não tem backend nem conta.
Isso deixa o app instantâneo e privado, e é o motivo de o modelo de dados ter que ser pequeno o
bastante para serializar inteiro. Sincronizar com um servidor é um acréscimo por cima disso, não
uma troca: o servidor é uma cópia, então o app nunca espera por ele e continua funcionando quando
ele cai.

**Um documento por chave, com revisão, em vez de uma tabela por widget.** O servidor guarda
exatamente o que o navegador guarda, um documento JSON por usuário e chave, e não olha dentro
dele. Isso manteve os 25 widgets fora do schema do servidor, e a escrita é um único comando
atômico que só vale se a revisão informada for a que está registrada. O preço é que um conflito
se resolve escolhendo uma versão inteira, nunca mesclando campos.

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

O que é conferido hoje, localmente e na CI a cada push:

```bash
cd frontend && npm run build && npm run lint && npm test   # o app
cd backend  && npm run lint && npm test                    # o servidor (precisa do Docker ligado)
./scripts/smoke.sh                                         # um servidor ligado, de ponta a ponta
SYNC_E2E_URL=http://localhost:8080/api npx vitest run src/sync/e2e.test.ts   # as stores reais do app contra um servidor real
```

Os testes do servidor sobem um PostgreSQL de verdade no Docker (Testcontainers), então o que
eles conferem é o que roda. A CI constrói os três containers e roda o smoke test contra eles.

Os testes cobrem a gramática do texto de tarefa (`TaskParser`), os helpers de data e tarefa e as
ações da store do dashboard e a volta do backup (exportar, limpar, importar). O resto é conferido à mão: essa mesma
volta entre dois navegadores, a persistência do layout depois de recarregar, e os widgets de gamificação
reagindo a uma tarefa concluída. O [`FEATURES.md`](FEATURES.md) documenta o sistema widget por
widget.

## Licença

[Creative Commons Attribution-NonCommercial 4.0 International](LICENSE). Use e adapte à
vontade, com crédito, mas não comercialmente.
