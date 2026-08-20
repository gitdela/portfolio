// @ts-check
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import turboPlugin from "eslint-plugin-turbo";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Paths no workspace should ever lint. Build output and vendored code only.
 * @type {string[]}
 */
export const sharedIgnores = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/.turbo/**",
  "**/coverage/**",
  "**/playwright-report/**",
  "**/test-results/**",
  "**/.lighthouseci/**",
];

/**
 * @typedef {object} BaseConfigOptions
 * @property {string} tsconfigRootDir Absolute directory of the consuming workspace, used to
 *   anchor the typescript-eslint project service. Pass `import.meta.dirname`.
 * @property {string[]} [additionalIgnores] Workspace-specific ignore globs.
 * @property {import("typescript-eslint").ConfigArray} [extend] Configs applied after the shared
 *   rules but before `eslint-config-prettier`, so formatting rules stay disabled last.
 */

/**
 * Shared flat config: type-checked TypeScript rules plus Turborepo environment hygiene.
 * @param {BaseConfigOptions} options
 * @returns {import("typescript-eslint").ConfigArray}
 */
export function baseConfig({ tsconfigRootDir, additionalIgnores = [], extend = [] }) {
  return tseslint.config(
    { ignores: [...sharedIgnores, ...additionalIgnores] },

    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,

    // Fails the lint when code reads an env var that turbo.json does not declare,
    // which is what keeps `envMode: "strict"` from silently dropping a value.
    turboPlugin.configs["flat/recommended"],

    {
      languageOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
        globals: { ...globals.node },
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      linterOptions: {
        reportUnusedDisableDirectives: "error",
      },
      rules: {
        // `verbatimModuleSyntax` is on, so type-only imports must be marked as such
        // or the emitted import survives into the bundle.
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { prefer: "type-imports", fixStyle: "inline-type-imports" },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
        // Submission payloads and tokens must never reach a log sink.
        "no-console": ["warn", { allow: ["warn", "error"] }],
        eqeqeq: ["error", "always", { null: "ignore" }],
      },
    },

    ...extend,

    // Config files and other plain JS are outside every tsconfig, so type-aware
    // rules cannot run against them.
    {
      files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
      extends: [tseslint.configs.disableTypeChecked],
    },

    prettierConfig,
  );
}
