import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setupTests.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        "**/dist/**",
        "**/build/**",
      ],
      thresholds: {
        global: {
          branches: 10,
          functions: 10,
          lines: 10,
          statements: 10,
        },
      },
    },
  },
});
