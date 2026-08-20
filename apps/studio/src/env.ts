/**
 * Studio environment. Only `SANITY_STUDIO_`-prefixed variables reach the browser bundle,
 * so nothing here is secret — the deploy token lives in CI only.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const studioEnv = {
  projectId: required("SANITY_STUDIO_PROJECT_ID", process.env.SANITY_STUDIO_PROJECT_ID),
  dataset: required("SANITY_STUDIO_DATASET", process.env.SANITY_STUDIO_DATASET),
  /** Where the Presentation tool points its preview iframe. */
  previewUrl: required("SANITY_STUDIO_PREVIEW_URL", process.env.SANITY_STUDIO_PREVIEW_URL),
} as const;
