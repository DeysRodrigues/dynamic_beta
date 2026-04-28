# 📖 Documentação Técnica - DynaBox v2.0

Bem-vindo à documentação oficial do **DynaBox**, um dashboard de produtividade modular projetado para centralizar sua vida digital em uma única interface personalizável e privada.

---

## 📋 Sumário
1. [Arquitetura Geral](#-1-arquitetura-geral)
2. [Sistemas de Core](#-2-sistemas-de-core)
3. [Catálogo de Widgets (Boxes)](#-3-catálogo-de-widgets-boxes)
4. [Módulos de Páginas](#-4-módulos-de-páginas)
5. [Guia de Testes e Validação](#-5-guia-de-testes-e-validação)

---

## 🏗️ 1. Arquitetura Geral

O DynaBox opera como um **Local-First Web App**.
- **Frontend:** React + TypeScript + Tailwind CSS.
- **Estado:** Zustand com persistência em `localStorage`.
- **Layout:** React-Grid-Layout para interatividade drag-and-drop.
- **Privacidade:** Sem banco de dados centralizado; sincronização opcional via Google Drive API.

---

## 🚀 2. Sistemas de Core

### 2.1 Dashboard & Layout Manager
O sistema de grid permite que o usuário crie múltiplos "Workspaces".
- **Funcionalidades:** Redimensionamento, reposicionamento, exclusão e adição dinâmica de blocos.
- **Focus Mode:** Remove distrações visuais da UI para priorizar o grid.

### 2.2 Task Engine
Um sistema de tarefas avançado com suporte a processamento de linguagem natural simples.
- **Smart Parsing:** Reconhecimento automático de tags e datas.
- **Bulk Operations:** Seleção múltipla para edições rápidas.
- **Time Tracking:** Cálculo de tempo investido por categoria.

### 2.3 Theme Engine (Personalização Estética)
Controle total sobre o visual:
- **Wallpaper Styles:** Suporte a CSS Patterns e Imagens Customizadas.
- **Visual FX:** Glassmorphism, desfoque de fundo e ajuste de brilho.
- **Color Sync:** Sincronização de cores primárias entre todos os componentes da UI.

### 2.4 Cloud Sync
Integração direta com Google Drive.
- Os dados são empacotados em um arquivo JSON criptografado na pasta `AppData` do Google Drive do usuário.

---

## 📦 3. Catálogo de Widgets (Boxes)

Cada "Box" é um micro-aplicativo independente dentro do dashboard.

| Nome do Widget | Descrição Técnica | Função Principal |
| :--- | :--- | :--- |
| **Activity Goals** | Monitoramento de metas de tempo. | Exibe progresso de horas por Tag. |
| **Automation** | Atalhos e automações simples. | Executa scripts ou macros pré-definidos. |
| **Book Tracker** | Gerenciador de leitura. | Registra páginas lidas e progresso de livros. |
| **Code Snippet** | Editor de código com realce. | Armazena trechos de código importantes. |
| **Countdown** | Timer regressivo para eventos. | Foca em prazos e datas importantes. |
| **Cozy Library** | Biblioteca visual. | Organização estética de coleções. |
| **Embedded Box** | Iframe interativo. | Incorpora YouTube, Spotify ou Notion. |
| **Habit Tracker** | Rastreador de hábitos. | Visualização em grade de consistência diária. |
| **Mini Calendar** | Calendário compacto. | Exibição rápida de datas e compromissos. |
| **Monthly Goals** | Metas mensais. | Planejamento de alto nível para o mês. |
| **Notepad** | Bloco de notas rápido. | Anotações voláteis e lembretes. |
| **Pixel Garden** | Gamificação de produtividade. | Flores crescem conforme tarefas são concluídas. |
| **Pomodoro** | Gerenciador de ciclos de foco. | Timer de 25/5 com notificações sonoras. |
| **Presence Calendar** | Mapa de calor (Heatmap). | Visualização estilo GitHub de atividade anual. |
| **Progress Box** | Barra de progresso geral. | Indica conclusão das tarefas do dia. |
| **Project Overview** | Resumo de projetos ativos. | Status rápido de metas de longo prazo. |
| **Quick Links** | Favoritos e atalhos. | Navegação rápida para URLs externas. |
| **Quick Workout** | Rotinas de exercícios. | Sugestões rápidas de atividades físicas. |
| **Risk Tracker** | Análise de riscos. | Monitoramento de impedimentos em projetos. |
| **RPG Profile** | Gamificação de perfil. | Sistema de XP e Level baseado em produtividade. |
| **Three Frogs** | Priorização (Eat the Frog). | Foca nas 3 tarefas mais difíceis do dia. |

---

## 📅 4. Módulos de Páginas

Além do dashboard, o DynaBox possui visualizações especializadas:

- **🏠 Home:** Dashboard principal interativo.
- **✅ Tasks Page:** Gerenciamento avançado de lista de tarefas (List View).
- **🎨 Themes Page:** Galeria de presets e customização avançada.
- **🗓️ Week Planner:** Visualização de agenda semanal para planejamento de horários.
- **📊 Projects Page:** Kanban ou lista detalhada de grandes objetivos.
- **📚 Wiki Page:** Repositório de conhecimento em Markdown.
- **🛒 Widget Store:** Interface para ativar e desativar componentes do sistema.

---

## 🧪 5. Guia de Testes e Validação

Para garantir a estabilidade do sistema, siga estes roteiros de teste:

### Teste de Sincronização (Cenário Crítico)
1. **Passo 1:** Adicione 3 tarefas e mude o tema para "Ocean".
2. **Passo 2:** Clique em "Backup" e confirme o sucesso.
3. **Passo 3:** Abra o site em um navegador diferente, faça login e clique em "Restaurar".
4. **Resultado Esperado:** As 3 tarefas e o tema "Ocean" devem ser carregados instantaneamente.

### Teste de Persistência de Layout
1. **Passo 1:** No modo de edição, mova o widget de Pomodoro para o topo direito.
2. **Passo 2:** Altere o tamanho do Notepad.
3. **Passo 3:** Reinicie a página (`F5`).
4. **Resultado Esperado:** O grid deve manter as posições e tamanhos customizados.

### Teste de Gamificação (RPG + Garden)
1. **Passo 1:** Note o XP atual no `RpgProfileBox` e o estado do `PixelGardenBox`.
2. **Passo 2:** Conclua uma tarefa de alta prioridade.
3. **Resultado Esperado:** O XP deve subir proporcionalmente e uma nova animação/planta deve surgir no jardim.

---
*DynaBox Documentation - Gerada em Abril de 2026*
