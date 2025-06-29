import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable ALL TypeScript rules
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/triple-slash-reference": "off",

      // Disable React rules
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react/prop-types": "off",

      // Disable Next.js rules
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",

      // Disable general JavaScript rules
      "prefer-const": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "no-debugger": "off",
      "no-empty": "off",
      "no-irregular-whitespace": "off",
      "no-mixed-spaces-and-tabs": "off",
    },
  },
];

export default eslintConfig;
