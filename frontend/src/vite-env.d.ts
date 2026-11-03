/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * The server the app starts out pointed at. The Docker build sets it to `/api` (the address the
   * app itself is served from). Empty or missing means local only: the person types a server.
   */
  readonly VITE_DEFAULT_SERVER_URL?: string;
}
