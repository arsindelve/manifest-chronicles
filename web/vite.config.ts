import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { DATA_FILES, dataFolder } from "./src/datafiles.ts";

// Serve the game's data files at /data/ in dev and copy them into dist/data/
// on build, byte for byte.
const pathOf = (name: string) => resolve(import.meta.dirname, dataFolder(name), name);

function gameData(): Plugin {
  return {
    name: "manifest-game-data",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/^\/data\/([^?]+)/);
        const name = m && decodeURIComponent(m[1]);
        if (!name || !DATA_FILES.includes(name)) {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/octet-stream");
        res.end(readFileSync(pathOf(name)));
      });
    },
    generateBundle() {
      for (const name of DATA_FILES) {
        this.emitFile({ type: "asset", fileName: `data/${name}`, source: readFileSync(pathOf(name)) });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [gameData()],
  build: { target: "es2022" },
});
