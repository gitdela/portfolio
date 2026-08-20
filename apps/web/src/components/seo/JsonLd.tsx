/**
 * Serializes structured data into a script tag.
 *
 * CMS text can contain `<`, and an unescaped `</script>` inside a JSON-LD block ends the
 * script element early and turns the rest of the payload into markup. Escaping `<` to its
 * unicode form is valid JSON and closes that off; `>` and `&` are escaped for the same
 * class of reason.
 */
function serialize(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function JsonLd({ data }: { data: unknown }) {
  const blocks: unknown[] = Array.isArray(data) ? data : [data];

  return (
    <>
      {blocks.filter(Boolean).map((block) => {
        const json = serialize(block);
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
