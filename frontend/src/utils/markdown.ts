/**
 * Flips the Nth task-list marker (`- [ ]` <-> `- [x]`) of a markdown text and returns the new
 * text. Markers inside fenced code blocks are ignored, as markdown ignores them too.
 */
export function toggleTaskAt(text: string, index: number): string {
  let inFence = false;
  let seen = 0;

  return text
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      if (inFence) return line;
      const match = line.match(/^(\s*(?:[-*+]|\d+[.)])\s+)\[( |x|X)\](\s|$)/);
      if (!match) return line;
      if (seen++ !== index) return line;
      const mark = match[2] === " " ? "x" : " ";
      return line.replace(/\[( |x|X)\]/, `[${mark}]`);
    })
    .join("\n");
}
