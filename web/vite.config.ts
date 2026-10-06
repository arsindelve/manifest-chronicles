import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { DATA_FILES } from "./src/datafiles";

// The game's original data files live in the repo root, next to M.BAS.
// Serve them at /data/ in dev and copy them into dist/data/ on build,
// byte-for-byte, so the web version reads exactly what QuickBASIC read.
const ROOT = resolve(__dirname, "..");

function gameData(): Plugin {
  return {
    name: "manifest-game-data",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/^\/data\/([^?]+)/);
        const name = m && decodeURIComponent(m[1]);
        if (!name || !DATA_FILES.includes(name)) return next();
        res.setHeader("Content-Type", "application/octet-stream");
        res.end(readFileSync(resolve(ROOT, name)));
      });
    },
    generateBundle() {
      for (const name of DATA_FILES) {
        this.emitFile({ type: "asset", fileName: `data/${name}`, source: readFileSync(resolve(ROOT, name)) });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [gameData()],
  build: { target: "es2022" },
});
