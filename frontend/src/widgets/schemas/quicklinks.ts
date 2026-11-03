import { z } from "zod";

export const linkItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
});

export const linkCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  links: z.array(linkItemSchema),
});

export const quickLinksContentSchema = z.object({
  categories: z.array(linkCategorySchema).optional(),
  viewMode: z.enum(["list", "grid"]).optional(),
});

export type LinkItem = z.infer<typeof linkItemSchema>;
export type LinkCategory = z.infer<typeof linkCategorySchema>;
export type QuickLinksContent = z.infer<typeof quickLinksContentSchema>;
