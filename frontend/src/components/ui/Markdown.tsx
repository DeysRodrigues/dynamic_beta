import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
  /**
   * Makes the `- [ ]` checkboxes clickable. Receives the position of the clicked checkbox among
   * all the checkboxes of the text (0 = the first one); see `toggleTaskAt` in `@/utils/markdown`.
   */
  onToggleTask?: (index: number) => void;
}

/**
 * Renders GitHub-flavoured markdown (headings, lists, task lists, tables, code, links, strike).
 * Raw HTML in the text is not rendered, only escaped, and unsafe link schemes are dropped, so
 * it is safe to feed it text the user typed or imported.
 */
function MarkdownView({ children, className, onToggleTask }: MarkdownProps) {
  // react-markdown renders in document order, so a counter reset on every render tells each
  // checkbox its position.
  let checkboxIndex = 0;

  return (
    <div className={cn("md-body text-sm leading-relaxed break-words", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold mt-3 mb-2 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1 first:mt-0">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-bold mt-2 mb-1">{children}</h4>,
          p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
              {children}
            </a>
          ),
          ul: ({ className, children }) => (
            <ul className={cn("my-2 pl-5", className?.includes("contains-task-list") ? "list-none pl-0" : "list-disc")}>
              {children}
            </ul>
          ),
          ol: ({ children }) => <ol className="my-2 pl-5 list-decimal">{children}</ol>,
          li: ({ className, children }) => (
            <li className={cn("my-0.5", className?.includes("task-list-item") && "flex items-start gap-2")}>{children}</li>
          ),
          input: ({ type, checked }) => {
            if (type !== "checkbox") return null;
            const index = checkboxIndex++;
            return (
              <input
                type="checkbox"
                checked={!!checked}
                readOnly={!onToggleTask}
                onChange={() => onToggleTask?.(index)}
                className={cn("mt-1 accent-primary", onToggleTask ? "cursor-pointer" : "pointer-events-none")}
              />
            );
          },
          blockquote: ({ children }) => <blockquote className="my-2 pl-3 pr-3 py-1.5 rounded-lg bg-current/5 opacity-80 italic">{children}</blockquote>,
          hr: () => <hr className="my-3 border-current/20" />,
          pre: ({ children }) => <pre className="my-2 p-3 rounded-lg bg-black/10 overflow-x-auto text-xs font-mono">{children}</pre>,
          code: ({ className, children }) => {
            const isBlock = /language-/.test(className ?? "") || String(children).includes("\n");
            return isBlock ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="px-1 py-0.5 rounded bg-black/10 text-[0.85em] font-mono">{children}</code>
            );
          },
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="px-2 py-1 text-left font-bold bg-current/10">{children}</th>,
          td: ({ children }) => <td className="px-2 py-1 even:bg-current/5">{children}</td>,
          img: ({ src, alt }) => <img src={src} alt={alt ?? ""} loading="lazy" className="max-w-full rounded-lg my-2" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export const Markdown = memo(MarkdownView);
