import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, TriangleAlert, XCircle } from "lucide-react";
import { ApiError, describeError, discoverServer, isBlockedAsMixedContent, normalizeServerUrl } from "@/sync/api";
import { connect } from "@/sync/connection";
import { DEFAULT_SERVER_URL } from "./serverDefaults";

type Check = { ok: true; registration: boolean; foundAt: string } | { ok: false; message: string } | null;

/** The form that connects this browser to a DynaBox server: address, test, then sign in or sign up. */
export function ConnectForm() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [check, setCheck] = useState<Check>(null);
  const [error, setError] = useState<string | null>(null);

  const address = normalizeServerUrl(serverUrl);
  const blocked = !!address && isBlockedAsMixedContent(address, location.protocol);
  const cannotRegister = check?.ok === true && !check.registration;

  async function testConnection() {
    setTesting(true);
    setCheck(null);
    setError(null);
    try {
      const { baseUrl, registration } = await discoverServer(address);
      setCheck({ ok: true, registration, foundAt: baseUrl });
      if (baseUrl !== address) setServerUrl(baseUrl); // it was under /api: keep the address that works
      if (!registration) setMode("login");
    } catch (e) {
      setCheck({ ok: false, message: describeError(e) });
    } finally {
      setTesting(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await connect({ serverUrl: address, mode, email, password });
    } catch (e) {
      setError(describeError(e instanceof ApiError ? e : new ApiError("server_error")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" aria-label="Conectar a um servidor">
      <div className="space-y-2">
        <label htmlFor="server-url" className="text-[10px] font-black uppercase tracking-widest opacity-50">Endereço do servidor</label>
        <p className="text-xs opacity-50">Se você ligou o Docker, é o endereço do app (por exemplo http://localhost:8080). O /api eu acho sozinho.</p>
        <div className="flex gap-2">
          <input
            id="server-url"
            value={serverUrl}
            onChange={(e) => { setServerUrl(e.target.value); setCheck(null); }}
            placeholder="http://localhost:8080/api"
            autoComplete="url"
            className="flex-1 px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={testConnection}
            disabled={!address || blocked || testing}
            className="px-4 py-3 rounded-xl bg-current/10 text-xs font-bold hover:bg-current/15 transition disabled:opacity-40"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : "Testar conexão"}
          </button>
        </div>

        {blocked && (
          <p className="flex items-start gap-2 text-xs text-amber-500" role="alert">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" /> {describeError(new ApiError("mixed_content"))}
          </p>
        )}
        {check?.ok && (
          <p className="flex items-center gap-2 text-xs text-emerald-500">
            <CheckCircle2 size={14} /> Servidor DynaBox encontrado em {check.foundAt}{check.registration ? "." : ", mas ele não aceita novas contas."}
          </p>
        )}
        {check && !check.ok && (
          <p className="flex items-start gap-2 text-xs text-red-500" role="alert">
            <XCircle size={14} className="mt-0.5 shrink-0" /> {check.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-current/5" role="tablist">
        {(["login", "register"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            disabled={value === "register" && cannotRegister}
            onClick={() => { setMode(value); setError(null); }}
            className={`py-2 rounded-lg text-xs font-bold transition disabled:opacity-30 ${mode === value ? "bg-primary text-primary-foreground" : "opacity-60 hover:opacity-100"}`}
          >
            {value === "login" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="account-email" className="text-[10px] font-black uppercase tracking-widest opacity-50">E-mail</label>
          <input id="account-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="w-full px-4 py-3 text-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="account-password" className="text-[10px] font-black uppercase tracking-widest opacity-50">Senha</label>
          <input
            id="account-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? 8 : undefined}
            required
            className="w-full px-4 py-3 text-sm"
          />
        </div>
      </div>
      {mode === "register" && <p className="text-xs opacity-50">A senha precisa ter pelo menos 8 caracteres. Ela fica guardada de forma protegida (argon2).</p>}

      {error && (
        <p className="flex items-start gap-2 text-sm text-red-500" role="alert">
          <XCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !address || blocked}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {busy && <Loader2 size={16} className="animate-spin" />}
        {mode === "login" ? "Entrar e sincronizar" : "Criar conta e sincronizar"}
      </button>
    </form>
  );
}
