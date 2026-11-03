export const APP_UPDATES = {
  version: "0.13.0",
  date: "Novembro de 2026",

  emoji: "☁️",

  title: "Conta e banco de dados (opcional)",

  message:
    "A maior atualização do Dyna: agora você pode ter uma conta e uma cópia dos seus dados num banco, rodando no seu próprio Docker. Se preferir, continua tudo só no navegador.",

  items: [
    "🗄️ Dois modos: só no navegador (como sempre) ou com conta e banco PostgreSQL. A escolha é feita dentro do app, em Conta.",
    "🔄 Sincronização entre aparelhos, com conflitos resolvidos por você e funcionamento offline.",
    "🐳 Um comando sobe tudo: app, API e banco com docker compose.",
    "🧹 Em Conta, o novo 'Restaurar widgets' devolve o painel ao padrão sem apagar seus dados.",
    "⏱️ O login dura 14 dias; depois disso o app volta ao modo local sem perder nada.",
  ],

  footer: "Ver como funciona",

  /** Where the bell sends the person to read more. */
  link: { to: "/wiki?secao=news", label: "Ler na Wiki" },
};
