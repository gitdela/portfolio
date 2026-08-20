import { isSingletonType, schemaTypes } from "@portfolio/sanity/schema";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { studioEnv } from "./src/env";
import { presentationLocations } from "./src/presentation";
import { structure } from "./src/structure";

export default defineConfig({
  name: "portfolio",
  title: "Portfolio",
  projectId: studioEnv.projectId,
  dataset: studioEnv.dataset,

  schema: {
    types: schemaTypes,
    // Singletons are reachable only through the structure, never through "create new".
    templates: (templates) => templates.filter(({ schemaType }) => !isSingletonType(schemaType)),
  },

  document: {
    // Singletons cannot be duplicated, deleted, or created ad hoc — there is exactly one.
    actions: (actions, { schemaType }) =>
      isSingletonType(schemaType)
        ? actions.filter(({ action }) =>
            ["publish", "discardChanges", "restore"].includes(action ?? ""),
          )
        : actions,
  },

  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve: presentationLocations,
      previewUrl: {
        origin: studioEnv.previewUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
    }),
    visionTool({ defaultApiVersion: "2026-08-01" }),
  ],
});
