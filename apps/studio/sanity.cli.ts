import { defineCliConfig } from "sanity/cli";

/**
 * Schema extraction and TypeGen write into `packages/sanity`, which both the Studio and
 * the web app consume. Both run automatically during `sanity dev` so a schema edit
 * refreshes the generated types immediately; CI runs the same work through the explicit
 * `typegen` script and fails if the working tree changes.
 */

// Spread conditionally rather than assigning `undefined`: under
// `exactOptionalPropertyTypes` an absent key and an explicit `undefined` are different
// things, and the CLI expects the key to be absent when the value is unset.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
const appId = process.env.SANITY_STUDIO_APP_ID;

export default defineCliConfig({
  api: {
    ...(projectId ? { projectId } : {}),
    ...(dataset ? { dataset } : {}),
  },

  deployment: {
    ...(appId ? { appId } : {}),
    autoUpdates: false,
  },

  schemaExtraction: {
    enabled: true,
    path: "../../packages/sanity/schema.json",
    watchPatterns: ["../../packages/sanity/src/schema/**/*.ts"],
  },

  typegen: {
    enabled: true,
    schema: "../../packages/sanity/schema.json",
    path: "../../packages/sanity/src/queries/**/*.ts",
    generates: "../../packages/sanity/src/generated/sanity.types.ts",
    formatGeneratedCode: true,
    overloadClientMethods: true,
  },
});
