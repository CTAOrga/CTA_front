import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import cypress from "eslint-plugin-cypress";

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
  {
    files: ["cypress/**/*.cy.{js,jsx}", "cypress/**/?(*.)cy.{js,jsx}"],
    plugins: { cypress },
    rules: {
      ...cypress.configs.recommended.rules,
      "no-unused-expressions": "off", // útil para should('exist'), etc.
      // 'cypress/unsafe-to-chain-command': 'off' // si te molesta el warning de .clear().type()
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha, // describe/it/before/after
        cy: "readonly",
        Cypress: "readonly",
        expect: "readonly",
      },
    },
  },

  // (opcional) Para archivos de config Node
  {
    files: ["cypress.config.*", "vite.config.*", "eslint.config.*"],
    languageOptions: { globals: { ...globals.node } },
  },
]);
