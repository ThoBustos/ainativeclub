import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:4015",
  },
  webServer: {
    command: "pnpm dev",
    port: 4015,
    reuseExistingServer: !process.env.CI,
  },
});
