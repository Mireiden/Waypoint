// @ts-check

import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";

export default defineConfig(
  {
    ignores: ["**/build/**", "**/dist/**", "**/node_modules/**", "**/generated/**"],
  },
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      //"@eslint-plugin-perfectionist": perfectionist,
    },
  },
  {
    files: ["**/*.ts"],
    extends: [
      tseslint.configs.recommended,
      //perfectionist.configs["recommended-natural"],
      // tseslint.configs.strictTypeChecked,
      // tseslint.configs.stylisticTypeChecked,
    ],
  },
);
