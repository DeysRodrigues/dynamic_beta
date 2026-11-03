/**
 * Talks to a DynaBox server. Every failure becomes an `ApiError` with a `code` the screen can
 * turn into a sentence, so a person sees "wrong password" and not "Failed to fetch".
 */
export type ApiErrorCode =
  | "network" // no answer: server down, wrong address, CORS blocked, or no internet
  | "mixed_content" // an https page asked for an http server
  | "not_dynabox" // an answer came, but not from a DynaBox server
  | "invalid_credentials"
  | "email_taken"
  | "registration_disabled"
  | "invalid_request"
  | "unauthorized"
  | "rate_limited"
  | "payload_too_large"
  | "revision_conflict"
  | "server_error";

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;
  /** For a conflict: what the server has. */
  current?: ServerDocument | null;

  constructor(code: ApiErrorCode, status?: number, current?: ServerDocument | null) {
    super(code);
    this.code = code;
    this.status = status;
    this.current = current;
  }
}

export interface ServerDocument {
  payload: unknown;
  version: number;
  revision: number;
  updatedAt: string;
}

export interface Account {
  id: string;
  email: string;
}

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Cleans what a person typed as the server address: trims, adds a scheme, drops the trailing slash. */
export function normalizeServerUrl(input: string): string {
  let url = input.trim();
  if (!url) return "";
  if (url.startsWith("/")) return url.replace(/\/+$/, ""); // same address as the app, e.g. /api
  if (!/^https?:\/\//i.test(url)) {
    const host = url.split(/[/:]/)[0];
    url = `${LOCAL_HOSTS.has(host) ? "http" : "https"}://${url}`;
  }
  return url.replace(/\/+$/, "");
}

/**
 * Whether the browser will refuse this server from this page: an https page may not call an http
 * server, except on this very machine, which browsers treat as safe (Safari excepted).
 */
export function isBlockedAsMixedContent(serverUrl: string, pageProtocol: string): boolean {
  if (pageProtocol !== "https:" || !/^http:\/\//i.test(serverUrl)) return false;
  try {
    return !LOCAL_HOSTS.has(new URL(serverUrl).hostname);
  } catch {
    return false;
  }
}

const codeFromStatus = (status: number): ApiErrorCode =>
  status === 401 ? "unauthorized" : status === 413 ? "payload_too_large" : status === 429 ? "rate_limited" : status >= 500 ? "server_error" : "invalid_request";

export interface ApiOptions {
  baseUrl: string;
  getToken?: () => string | null;
  /** Called when the server says the token is no longer good. */
  onUnauthorized?: () => void;
  fetchFn?: FetchFn;
  pageProtocol?: string;
}

/** A client for one server. `fetchFn` and `pageProtocol` can be replaced in tests. */
export function createApi(options: ApiOptions) {
  const fetchFn: FetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
  const pageProtocol = options.pageProtocol ?? (typeof location === "undefined" ? "http:" : location.protocol);

  async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
    if (isBlockedAsMixedContent(options.baseUrl, pageProtocol)) throw new ApiError("mixed_content");

    const headers: Record<string, string> = {};
    // A Content-Type with no body makes some servers reject the request, so send it only with one.
    if (body !== undefined) headers["content-type"] = "application/json";
    const token = auth ? options.getToken?.() : null;
    if (token) headers.authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetchFn(`${options.baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError("network");
    }

    if (response.status === 204) return undefined as T;

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      // Something answered, but not with JSON: a web page, a proxy error, another service.
      throw new ApiError(response.ok ? "not_dynabox" : codeFromStatus(response.status), response.status);
    }

    if (response.ok) return data as T;

    const error = (data as { error?: string; current?: ServerDocument | null }) ?? {};
    if (response.status === 401 && auth && token) options.onUnauthorized?.();
    throw new ApiError(
      (error.error as ApiErrorCode | undefined) && isKnownCode(error.error) ? (error.error as ApiErrorCode) : codeFromStatus(response.status),
      response.status,
      error.current
    );
  }

  return {
    /** Checks that the address is a DynaBox server, and whether it lets people sign up. */
    async health() {
      const data = await request<{ status?: string; service?: string; registration?: boolean }>("GET", "/health", undefined, false);
      if (data.service !== "dynabox-api") throw new ApiError("not_dynabox");
      return { registration: data.registration !== false };
    },
    register: (email: string, password: string) => request<{ token: string; user: Account }>("POST", "/auth/register", { email, password }, false),
    login: (email: string, password: string) => request<{ token: string; user: Account }>("POST", "/auth/login", { email, password }, false),
    me: () => request<Account>("GET", "/auth/me"),
    pull: () => request<{ documents: Record<string, ServerDocument> }>("GET", "/sync"),
    push: (key: string, payload: unknown, version: number, baseRevision: number) =>
      request<{ revision: number }>("PUT", `/sync/${encodeURIComponent(key)}`, { payload, version, baseRevision }),
    deleteAll: () => request<void>("DELETE", "/sync"),
  };
}

/**
 * Finds the API behind an address a person typed. People who run the Docker setup type the address
 * of the app (`http://localhost:8080`), but the server answers under `/api`, so when the address
 * itself is not a DynaBox server this tries `<address>/api` too. Returns the address that worked.
 */
export async function discoverServer(address: string, options: Omit<ApiOptions, "baseUrl"> = {}): Promise<{ baseUrl: string; registration: boolean }> {
  const candidates = [address];
  if (!/\/api$/i.test(address)) candidates.push(`${address}/api`);

  let first: unknown;
  for (const [index, baseUrl] of candidates.entries()) {
    try {
      const { registration } = await createApi({ ...options, baseUrl }).health();
      return { baseUrl, registration };
    } catch (error) {
      if (index === 0) first = error;
      // Only "nothing answered here" and "something else answered" are worth trying /api for.
      const retry = error instanceof ApiError && (error.code === "network" || error.code === "not_dynabox");
      if (!retry) throw error;
    }
  }
  throw first;
}

export type SyncApi = Pick<ReturnType<typeof createApi>, "pull" | "push" | "deleteAll">;

const KNOWN: readonly string[] = ["invalid_credentials", "email_taken", "registration_disabled", "invalid_request", "unauthorized", "payload_too_large", "revision_conflict"];
const isKnownCode = (code: unknown): code is ApiErrorCode => typeof code === "string" && KNOWN.includes(code);

/** What to tell the person, in Portuguese. */
export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Algo deu errado. Tente de novo.";
  switch (error.code) {
    case "network":
      return "Não consegui falar com o servidor. Confira o endereço, se ele está ligado e se o site dele permite este endereço (CORS).";
    case "mixed_content":
      return "Este site usa HTTPS e o endereço do servidor é http. O navegador bloqueia isso. Use um endereço https, ou http://localhost.";
    case "not_dynabox":
      return "Esse endereço respondeu, mas não parece ser um servidor DynaBox.";
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_taken":
      return "Já existe uma conta com esse e-mail. Entre em vez de criar.";
    case "registration_disabled":
      return "Este servidor não está aceitando novas contas.";
    case "invalid_request":
      return "Confira o e-mail e a senha (a senha precisa ter pelo menos 8 caracteres).";
    case "unauthorized":
      return "Sua sessão expirou. Entre de novo.";
    case "rate_limited":
      return "Muitas tentativas. Espere um minuto e tente de novo.";
    case "payload_too_large":
      return "Esse conteúdo é grande demais para sincronizar.";
    case "server_error":
      return "O servidor deu erro. Tente de novo daqui a pouco.";
    default:
      return "Algo deu errado. Tente de novo.";
  }
}
