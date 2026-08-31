import { jsonLdGraph } from "@/lib/seo";

/**
 * Renders a schema.org graph as a JSON-LD script tag.
 *
 * `dangerouslySetInnerHTML` is the only way to put a JSON payload inside a
 * <script> from React — children would be HTML-escaped into &quot; and the
 * block would not parse.
 *
 * The input is JSON.stringify output, so the one thing that can break out of
 * the element is a literal "</script>" inside a string value. Project titles
 * and descriptions are editor-supplied and reach this component, so every "<"
 * is replaced with its JSON unicode escape — same string once parsed, inert in HTML.
 *
 * A server component: structured data has no reason to ship to the browser.
 */
export function JsonLd({ nodes }: { nodes: Array<Record<string, unknown> | null | undefined> }) {
  const json = JSON.stringify(jsonLdGraph(...nodes)).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
