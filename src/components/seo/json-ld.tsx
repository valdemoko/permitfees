import { serializeJsonLd, type JsonLdObject } from "@/lib/seo/jsonld";

/**
 * Renders structured data.
 *
 * `serializeJsonLd` escapes `<` so a value containing `</script>` cannot break
 * out of the tag. Nothing here is user input today, but the escaping is not
 * conditional on that staying true.
 */
export function JsonLd({ data }: { data: JsonLdObject | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

/**
 * Renders several blocks. Kept separate from `JsonLd` so a page can pass a list
 * and have `null` entries skipped, rather than repeating a null check at every
 * call site.
 */
export function JsonLdBlocks({ blocks }: { blocks: Array<JsonLdObject | null> }) {
  const usable = blocks.filter((block): block is JsonLdObject => block !== null);
  if (usable.length === 0) return null;

  return (
    <>
      {usable.map((block, index) => (
        <JsonLd key={`${String(block["@type"] ?? "jsonld")}-${index}`} data={block} />
      ))}
    </>
  );
}
