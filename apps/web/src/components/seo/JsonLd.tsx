import { serializeJsonLd } from "@/lib/seo/jsonld";

export function JsonLd({ data }: { data: unknown }) {
  const blocks: unknown[] = Array.isArray(data) ? data : [data];

  return (
    <>
      {blocks.filter(Boolean).map((block) => {
        const json = serializeJsonLd(block);
        return (
          // The serialized payload is itself a stable identity for the block, and each page
          // emits a fixed, non-reordering set.
          <script
            key={json}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
          />
        );
      })}
    </>
  );
}
