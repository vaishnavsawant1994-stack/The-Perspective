import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./src/testing/server-only.ts", import.meta.url),
      ),
    },
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.database.test.ts"],
    passWithNoTests: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
