// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // 👇 Aquí la configuración más importante
    baseUrl: "http://localhost:5173", // Reemplaza 3000 si tu app corre en otro puerto

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
