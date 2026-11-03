import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // One Postgres container for the whole run; each test file gets its own database in it.
    globalSetup: ["./test/globalSetup.ts"],
    // Tests that start a Postgres container need time to pull and boot it.
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
