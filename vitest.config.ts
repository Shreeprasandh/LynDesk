import { defineConfig } from "vitest/config";
import path from "path";

try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process as any).loadEnvFile?.(".env.local");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process as any).loadEnvFile?.(".env");
} catch {}

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 15000,
    include: ["src/__tests__/**/*.test.ts", "src/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
