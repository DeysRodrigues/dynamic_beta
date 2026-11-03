import { describe, it, expect, afterEach } from "vitest";
import { clearAppData } from "@/persistence/backup";
import { PERSISTED_STORES, rehydrateAll } from "@/persistence/hydration";
import { useDashboardStore, selectActiveWorkspace } from "@/store/useDashboardStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useTagStore } from "@/store/useTagStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useUserStore } from "@/store/useUserStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { connect, disconnect } from "./connection";
import { useSync } from "./status";

/**
 * Against a REAL running server (the Docker setup), with the real stores. Skipped unless
 * SYNC_E2E_URL is set:  SYNC_E2E_URL=http://localhost:8080/api npx vitest run src/sync/e2e.test.ts
 */
const url = process.env.SYNC_E2E_URL;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function reloadPage() {
  const snapshot = Object.entries({ ...localStorage });
  for (const store of PERSISTED_STORES as unknown as Array<{ getInitialState: () => object; setState: (s: object, r: boolean) => void }>) {
    store.setState(store.getInitialState(), true);
  }
  localStorage.clear();
  for (const [k, v] of snapshot) localStorage.setItem(k, v);
  await rehydrateAll();
}

afterEach(() => disconnect("user"));

describe.skipIf(!url)("contra o servidor real", () => {
  const email = `e2e-${Date.now()}@example.com`;
  const creds = { serverUrl: url ?? "", email, password: "uma-senha-longa" };

  it("conectar, mexer em tudo, sair, resetar, recarregar e entrar de novo restaura tudo", async () => {
    await connect({ ...creds, mode: "register" });

    useUserStore.getState().setName("Deys E2E");
    useDashboardStore.getState().addBox("notepad");
    useThemeStore.getState().setPrimaryColor("#12ab34");
    useTagStore.getState().addTag("e2e");
    useBoxContentStore.getState().setBoxContent("notepad-e2e", { text: "nota do e2e" });
    await wait(2500);

    const status1 = useSync.getState();
    console.log("depois de editar:", status1.status, "conflitos:", status1.conflicts.length);

    disconnect("user");
    clearAppData();
    await reloadPage();
    expect(useUserStore.getState().name).not.toBe("Deys E2E");

    await connect({ ...creds, mode: "login" });
    const after = useSync.getState();
    console.log("depois de entrar:", after.status, "conflitos:", after.conflicts.map((c) => c.key), "problema:", after.problem);

    expect(useUserStore.getState().name).toBe("Deys E2E");
    expect(selectActiveWorkspace(useDashboardStore.getState())!.boxes.some((b) => b.type === "notepad")).toBe(true);
    expect(useThemeStore.getState().primaryColor).toBe("#12ab34");
    expect(useTagStore.getState().tags).toContain("e2e");
    expect(useBoxContentStore.getState().contents["notepad-e2e"]).toEqual({ text: "nota do e2e" });
    expect(after.conflicts).toHaveLength(0);
  }, 30000);

  it("depois de entrar de novo, o que se muda continua indo para o servidor", async () => {
    await connect({ ...creds, mode: "login" });
    useUserStore.getState().setName("Segundo nome");
    useProjectStore.getState().setActiveProject(null);
    await wait(2500);

    const res = await fetch(`${url}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password: creds.password }) });
    const { token } = (await res.json()) as { token: string };
    const docs = (await (await fetch(`${url}/sync`, { headers: { authorization: `Bearer ${token}` } })).json()) as { documents: Record<string, { payload: { state: { name?: string } } }> };
    console.log("chaves no servidor:", Object.keys(docs.documents));
    expect(docs.documents["user-profile-storage"]?.payload.state.name).toBe("Segundo nome");
  }, 30000);
});
