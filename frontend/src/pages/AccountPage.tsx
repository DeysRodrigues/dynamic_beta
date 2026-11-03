import { Link } from "react-router-dom";
import { ArrowRight, Cloud, HardDrive } from "lucide-react";
import { ConnectForm } from "@/features/account/ConnectForm";
import { ConnectedPanel } from "@/features/account/ConnectedPanel";
import { useSession } from "@/sync/session";
import { useSync } from "@/sync/status";

const NOTICES: Record<string, string> = {
  session_expired: "Sua sessão expirou, então voltei a usar só este navegador. Entre de novo para sincronizar.",
  data_deleted: "Os dados da conta foram apagados do servidor. Você voltou a usar só este navegador, e seus dados daqui continuam salvos.",
};

export default function AccountPage() {
  const connected = useSession((s) => !!s.token);
  const problem = useSync((s) => s.problem);

  return (
    <div className="min-h-screen flex flex-col items-center bg-transparent animate-in fade-in duration-500">
      <div className="w-full max-w-2xl space-y-8 pt-10 pb-20 px-4" style={{ color: "var(--box-text-color)" }}>
        <header className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Conta e sincronização</h1>
          <p className="text-sm opacity-60">Por padrão, o DynaBox guarda tudo só neste navegador. Se quiser, você pode ter uma conta e uma cópia dos dados em um banco de dados.</p>
        </header>

        {!connected && problem && NOTICES[problem] && (
          <p role="status" className="rounded-2xl bg-amber-500/10 text-amber-500 text-sm p-4">{NOTICES[problem]}</p>
        )}

        {connected ? (
          <section className="box-padrao p-6 space-y-2" aria-label="Conta conectada">
            <div className="flex items-center gap-2 mb-4"><Cloud size={18} className="text-primary" /><h2 className="font-bold">Conectado a um servidor</h2></div>
            <ConnectedPanel />
          </section>
        ) : (
          <>
            <section className="box-padrao p-6 space-y-2" aria-label="Modo atual">
              <div className="flex items-center gap-2"><HardDrive size={18} className="text-primary" /><h2 className="font-bold">Só neste navegador</h2></div>
              <p className="text-sm opacity-60">Seus dados ficam salvos só aqui. Não precisa de conta e funciona sem internet. Para usar em mais de um aparelho e ter uma cópia num banco de dados, conecte-se a um servidor DynaBox.</p>
            </section>

            <section className="box-padrao p-6 space-y-6" aria-label="Conectar a um servidor">
              <ConnectForm />
              <Link to="/wiki?secao=server" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition">
                Ainda não tem um servidor? Veja como ligar o seu <ArrowRight size={14} />
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
