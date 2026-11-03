/** The server the app starts out pointed at; empty on the published site, `/api` in the Docker build. */
export const DEFAULT_SERVER_URL: string = import.meta.env.VITE_DEFAULT_SERVER_URL ?? "";
