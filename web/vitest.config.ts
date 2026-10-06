import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // The DOSBox comparison needs a running emulator; run it explicitly.
    exclude: ["test/**/*.dosbox.test.ts"],
    testTimeout: 60000,
  },
});
