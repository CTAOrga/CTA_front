import { defineConfig } from "cypress";

export default defineConfig({
  video: true, // habilita MP4 en "cypress run"
  videosFolder: "cypress/videos", // opcional, default
  screenshotsFolder: "cypress/screenshots", // opcional, default
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      // plugins si necesitás
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
