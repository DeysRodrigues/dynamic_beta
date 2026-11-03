import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    pgAdminUrl: string;
  }
}

/** Starts one throwaway Postgres for the whole test run and stops it at the end. */
export default async function setup(project: TestProject) {
  const container = await new PostgreSqlContainer("postgres:17-alpine").start();
  project.provide("pgAdminUrl", container.getConnectionUri());
  return async () => {
    await container.stop();
  };
}
