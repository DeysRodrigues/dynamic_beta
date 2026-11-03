/** JSON with the keys of every object in sorted order, so equal data gives equal text. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** A short fingerprint of a text (FNV-1a), to tell whether a saved value changed without keeping a copy of it. */
export function fingerprint(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0") + text.length.toString(16);
}

/** Parses what the stores keep in `localStorage`; `undefined` when it is not valid JSON. */
export function tryParse(text: string): { value: unknown } | undefined {
  try {
    return { value: JSON.parse(text) };
  } catch {
    return undefined;
  }
}

/** Whether a saved text and a document from the server hold the same data. */
export function sameData(localText: string, serverPayload: unknown): boolean {
  const parsed = tryParse(localText);
  return parsed !== undefined && stableStringify(parsed.value) === stableStringify(serverPayload);
}
