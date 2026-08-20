/**
 * Runs the site with no Sanity project at all.
 *
 * Starts the local GROQ stand-in, points the Sanity client at it, and hands off to
 * `next dev`. Useful for a fresh clone, for working on layout and empty states, and as the
 * fixture backend for end-to-end tests.
 *
 * By default the dataset is empty, which is exactly the state a brand-new Sanity project is
 * in. Pass a JSON array of documents to see the site with content:
 *
 *   bun run dev:offline -- ./scripts/fixtures/seed.json
 */
import { startMockSanity } from "./mock-sanity";

const MOCK_PORT = Number(process.env.MOCK_SANITY_PORT ?? "3999");
const datasetFile = process.argv[2] ?? process.env.MOCK_SANITY_DATASET_FILE;

const server = await startMockSanity({ port: MOCK_PORT, datasetFile });

const port = process.env.PORT ?? "3000";

/*
 * Offline defaults so a fresh clone runs with no .env.local at all.
 *
 * Startup env validation stays exactly as strict as it is in a real environment — these
 * simply satisfy it. Nothing here is a credential: the Sanity ids address the local
 * stand-in, the Turnstile pair are Cloudflare's published always-pass test keys, and the
 * Resend values are never reached because sending is not exercised offline.
 *
 * Anything already set in the environment wins, so this never overrides real configuration.
 */
const OFFLINE_DEFAULTS: Record<string, string> = {
  NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
  NEXT_PUBLIC_SANITY_PROJECT_ID: "offline",
  NEXT_PUBLIC_SANITY_DATASET: "production",
  NEXT_PUBLIC_SANITY_API_VERSION: "2026-08-01",
  NEXT_PUBLIC_SANITY_STUDIO_URL: "http://localhost:3333",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
  SANITY_API_READ_TOKEN: "offline-no-token",
  SANITY_REVALIDATE_SECRET: "offline-no-secret",
  TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
  RESEND_API_KEY: "re_offline_placeholder",
  RESEND_FROM_EMAIL: "contact@send.example.com",
  CONTACT_TO_EMAIL: "you@example.com",
};

const env: Record<string, string | undefined> = { ...process.env };
for (const [key, value] of Object.entries(OFFLINE_DEFAULTS)) {
  env[key] ??= value;
}
// Always applied: this is what makes the client talk to the stand-in.
env.NEXT_PUBLIC_SANITY_API_HOST = `http://localhost:${String(MOCK_PORT)}`;

const next = Bun.spawn(["bunx", "next", "dev", "--port", port], {
  stdio: ["inherit", "inherit", "inherit"],
  env,
});

async function shutdown() {
  next.kill();
  await server.stop(true);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());

process.exit(await next.exited);
