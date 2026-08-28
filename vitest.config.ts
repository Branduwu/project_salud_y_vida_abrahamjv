import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts", "./tests/integration/setup.ts"],
    include: ["tests/{unit,integration}/**/*.{test,spec}.ts?(x)"],
    // Las pruebas de integración comparten una base PostgreSQL aislada y cada
    // caso la reinicializa; ejecutarlas en paralelo produciría carreras reales.
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**/*.ts", "src/server/**/*.ts"],
    },
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
