/**
 * A local stand-in for the Sanity query API, for running the site without a real project.
 *
 * It evaluates the app's actual GROQ with `groq-js` — the same evaluator Sanity itself uses —
 * against a document set loaded from disk. Pointing it at an empty set is what proves every
 * page handles "no content yet" rather than only handling "content present".
 *
 * Development only. Nothing here ships, and the app only talks to it when
 * NEXT_PUBLIC_SANITY_API_HOST is set.
 */
import * as groqJs from "groq-js";

/*
 * groq-js@2 declares `types` at its package root but omits a `types` condition from its
 * `exports` map. `tsc` still finds the sibling .d.ts; the TypeScript language service — and
 * so ESLint — does not, and sees the whole module as `any`. Declaring the small surface
 * actually used here keeps the type-aware lint meaningful rather than switching it off.
 */
interface GroqValue {
  get: () => Promise<unknown>;
}

interface GroqJsModule {
  parse: (query: string, options?: { params?: Record<string, unknown> }) => unknown;
  evaluate: (
    tree: unknown,
    options: { dataset: unknown; params?: Record<string, unknown> },
  ) => Promise<GroqValue>;
}

const { parse, evaluate } = groqJs as unknown as GroqJsModule;

export interface SanityDocument {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

export interface MockSanityOptions {
  port?: number;
  datasetFile?: string | undefined;
}

async function loadDataset(datasetFile: string | undefined): Promise<SanityDocument[]> {
  if (!datasetFile) return [];
  const file = Bun.file(datasetFile);
  if (!(await file.exists())) {
    console.warn(`[mock-sanity] ${datasetFile} not found — serving an empty dataset.`);
    return [];
  }
  return (await file.json()) as SanityDocument[];
}

/** Sanity passes query params as `$name=<json>` search params. */
function readParams(url: URL): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const [key, value] of url.searchParams) {
    if (!key.startsWith("$")) continue;
    try {
      params[key.slice(1)] = JSON.parse(value);
    } catch {
      params[key.slice(1)] = value;
    }
  }
  return params;
}

export async function startMockSanity(options: MockSanityOptions = {}) {
  const port = options.port ?? Number(process.env.MOCK_SANITY_PORT ?? "3999");
  const dataset = await loadDataset(options.datasetFile);

  const server = Bun.serve({
    port,
    async fetch(request) {
      const url = new URL(request.url);

      if (!url.pathname.includes("/data/query/")) {
        return Response.json({ error: "Not found", statusCode: 404 }, { status: 404 });
      }

      const query = url.searchParams.get("query");
      if (!query) {
        return Response.json({ error: "Missing query", statusCode: 400 }, { status: 400 });
      }

      try {
        const params = readParams(url);
        const tree = parse(query, { params });
        const value = await evaluate(tree, { dataset, params });
        const result = await value.get();

        return Response.json(
          { ms: 0, query, result },
          { headers: { "access-control-allow-origin": "*" } },
        );
      } catch (error) {
        // A GROQ error here is a bug in the query, so surface it loudly rather than
        // returning an empty result that would be indistinguishable from "no content".
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[mock-sanity] query failed: ${message}\n  ${query.slice(0, 200)}`);
        return Response.json({ error: message, statusCode: 400 }, { status: 400 });
      }
    },
  });

  console.log(
    `[mock-sanity] http://localhost:${String(server.port)} — ${String(dataset.length)} document(s)`,
  );

  return server;
}

if (import.meta.main) {
  await startMockSanity({ datasetFile: process.env.MOCK_SANITY_DATASET_FILE });
}
