// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Screen text mixes strings and numbers on purpose (QB's PRINT spacing).
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      // All text here is CP437 mapped to single UTF-16 code units, so spreading a string is safe.
      "@typescript-eslint/no-misused-spread": "off",
    },
  },
  { files: ["eslint.config.js"], ...tseslint.configs.disableTypeChecked },
  prettier,
);
