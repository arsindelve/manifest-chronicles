// Runs only the DOSBox side-by-side comparison (see test/compare.dosbox.test.ts).
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["test/**/*.dosbox.test.ts"], testTimeout: 900000 },
});
