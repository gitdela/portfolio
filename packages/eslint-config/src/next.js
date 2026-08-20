// @ts-check
import nextPlugin from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

import { baseConfig } from "./base.js";

/**
 * @typedef {object} NextConfigOptions
 * @property {string} tsconfigRootDir Absolute directory of the consuming workspace. Pass
 *   `import.meta.dirname`.
 * @property {string[]} [additionalIgnores] Workspace-specific ignore globs.
 */

/**
 * Flat config for the Next.js App Router workspace: shared TypeScript rules plus React Hooks,
 * accessibility, and Core Web Vitals checks.
 * @param {NextConfigOptions} options
 * @returns {import("typescript-eslint").ConfigArray}
 */
export function nextConfig({ tsconfigRootDir, additionalIgnores = [] }) {
  return baseConfig({
    tsconfigRootDir,
    additionalIgnores: ["next-env.d.ts", ".vercel/**", ...additionalIgnores],
    extend: tseslint.config(
      jsxA11y.flatConfigs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      nextPlugin.configs["core-web-vitals"],
      {
        languageOptions: {
          globals: { ...globals.browser, ...globals.node },
        },
        rules: {
          // The plan's accessibility target is a hard gate, not advice.
          "jsx-a11y/alt-text": "error",
          "jsx-a11y/anchor-is-valid": "error",
          "jsx-a11y/label-has-associated-control": "error",

          // Server Actions are async functions passed to `action`; the void-return
          // check misreads those as accidental promise returns.
          "@typescript-eslint/no-misused-promises": [
            "error",
            { checksVoidReturn: { attributes: false } },
          ],
        },
      },
    ),
  });
}
