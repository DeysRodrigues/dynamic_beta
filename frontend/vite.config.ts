import path from "path"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        // Library code changes far less often than the app, so splitting it keeps it cached
        // across deploys and lets the browser fetch the pieces in parallel.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          if (/node_modules\/(react-router|react-router-dom)\//.test(id)) return "router";
          if (/node_modules\/(react-grid-layout|react-resizable|react-draggable)\//.test(id)) return "grid";
          if (id.includes("node_modules/lucide-react")) return "icons";
          if (id.includes("node_modules/date-fns")) return "dates";
          if (id.includes("node_modules/zod")) return "zod";
          return undefined;
        },
      },
    },
  },

  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
