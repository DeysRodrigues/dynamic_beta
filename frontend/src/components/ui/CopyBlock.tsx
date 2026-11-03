import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A block of text, such as a command, with a button that copies it. It takes its colors from the text around it. */
export function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the text is selectable, so it can still be copied by hand */
    }
  }

  return (
    <div className="flex items-start gap-2 rounded-xl bg-current/10 p-3">
      <pre className="flex-1 overflow-x-auto text-xs font-mono whitespace-pre-wrap break-all select-all">{text}</pre>
      <button type="button" onClick={copy} className="shrink-0 p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-current/10 transition" aria-label="Copiar">
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
