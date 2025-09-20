import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
export default [
  { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tsparser }, plugins: { "@typescript-eslint": tseslint },
    rules: { "no-unused-vars": "warn" } }
];
