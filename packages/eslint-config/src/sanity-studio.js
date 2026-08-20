// @ts-check
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

import { baseConfig } from "./base.js";

/**
 * @typedef {object} SanityStudioConfigOptions
 * @property {string} tsconfigRootDir Absolute directory of the consuming workspace. Pass
 *   `import.meta.dirname`.
 * @property {string[]} [additionalIgnores] Workspace-specific ignore globs.
 */

/**
 * Flat config for the Sanity Studio workspace and the shared schema package.
 * @param {SanityStudioConfigOptions} options
 * @returns {import("typescript-eslint").ConfigArray}
 */
export function sanityStudioConfig({ tsconfigRootDir, additionalIgnores = [] }) {
  return baseConfig({
    tsconfigRootDir,
    additionalIgnores: ["**/generated/**", "schema.json", ...additionalIgnores],
    extend: tseslint.config(
      jsxA11y.flatConfigs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      {
        languageOptions: {
          globals: { ...globals.browser, ...globals.node },
        },
        rules: {
          // Sanity's `defineType`/`defineField` builders are deeply generic; the
          // unsafe-assignment family fires on their inferred internals rather than
          // on anything a schema author controls.
          "@typescript-eslint/no-unsafe-assignment": "off",
          "@typescript-eslint/no-unsafe-member-access": "off",
        },
      },
    ),
  });
}
