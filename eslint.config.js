import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import cypress from "eslint-plugin-cypress";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
  // ✅ Bloque para Cypress (E2E / Component)
  {
    files: ["cypress/**/*.cy.{js,jsx}", "cypress/**/?(*.)cy.{js,jsx}"],
    plugins: { cypress },
    // Usa las reglas recomendadas del plugin
    rules: {
      ...cypress.configs.recommended.rules,
      // útil para aserciones tipo `expect(el).to.be.visible`
      "no-unused-expressions": "off",
    },
    languageOptions: {
      // Define globals de mocha/cypress para evitar "describe is not defined"
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha, // describe/it/before/after
        cy: "readonly",
        Cypress: "readonly",
        expect: "readonly",
        assert: "readonly",
        chai: "readonly",
      },
    },
  },

  // ✅ Bloque para archivos de configuración Node (vite/cypress/eslint)
  {
    files: ["cypress.config.*", "vite.config.*", "eslint.config.*"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
]);
