import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    video: false,
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
