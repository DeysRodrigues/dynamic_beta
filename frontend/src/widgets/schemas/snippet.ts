import type { ElementType } from "react";
import { z } from "zod";

export const snippetSchema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string(),
  type: z.string(),
});

export const snippetTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  isCustom: z.boolean().optional(),
  // Components do not survive JSON, so a saved custom type has no icon. It is only here so the
  // built-in types, which do carry one, share the same type.
  icon: z.custom<ElementType | null>(() => true).optional(),
});

export const snippetContentSchema = z.object({
  snippets: z.array(snippetSchema).optional(),
  customTypes: z.array(snippetTypeSchema).optional(),
});

export type Snippet = z.infer<typeof snippetSchema>;
export type SnippetType = z.infer<typeof snippetTypeSchema>;
export type SnippetContent = z.infer<typeof snippetContentSchema>;
