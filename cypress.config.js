import { defineConfig } from "cypress";
import fs from "fs";
import path from "path";

const fsp = fs.promises;

function specFailed(runResult) {
  // true si hubo fallas en el spec (por stats o por attempts)
  if ((runResult?.stats?.failures ?? 0) > 0) return true;
  const tests = runResult?.tests ?? [];
  return tests.some((t) =>
    (t.attempts ?? []).some((a) => a.state === "failed")
  );
}

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function safeUnlink(filePath) {
  try {
    await fsp.unlink(filePath);
    // console.log('[cypress] borrado:', filePath)
  } catch (e) {
    if (e?.code !== "ENOENT") {
      console.warn("[cypress] no se pudo borrar:", filePath, e?.message);
    }
  }
}

export default defineConfig({
  video: true, // habilita MP4 en "cypress run"
  videosFolder: "cypress/videos", // opcional, default
  screenshotsFolder: "cypress/screenshots", // opcional, default
  videoCompression: 32,
  trashAssetsBeforeRuns: true,
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      // plugins si necesitás
      on("after:run", async (results) => {
        const runs = results?.runs ?? [];
        // pequeña espera por si el compresor termina "justo"
        await sleep(500);

        for (const r of runs) {
          const videoPath = r?.video;
          if (!videoPath) continue;

          if (!specFailed(r)) {
            // borrar el .mp4 final
            await safeUnlink(videoPath);

            // y cualquier temporal que Cypress haya dejado (por compresión)
            const dir = path.dirname(videoPath);
            const base = path.basename(videoPath, ".mp4");
            const maybeCompressed = path.join(dir, `${base}-compressed.mp4`);
            await safeUnlink(maybeCompressed);
          }
        }
      });
    },
  },
  // (opcional) si vas a usar Component Testing:
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
