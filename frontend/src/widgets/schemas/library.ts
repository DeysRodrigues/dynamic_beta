import { z } from "zod";

export const libraryCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
});

export const libraryBookSchema = z.object({
  id: z.string(),
  title: z.string(),
  link: z.string().optional(),
  // Books saved before categories existed have none; the widget assigns the first category.
  categoryId: z.string().optional(),
  completed: z.boolean(),
  color: z.string(),
  height: z.number(),
  pattern: z.number(),
});

export const libraryContentSchema = z.object({
  categories: z.array(libraryCategorySchema).optional(),
  books: z.array(libraryBookSchema).optional(),
  settings: z.object({ woodColor: z.string(), wallColor: z.string() }).optional(),
});

export type LibraryCategory = z.infer<typeof libraryCategorySchema>;
export type LibraryBookContent = z.infer<typeof libraryBookSchema>;
export type LibrarySettings = NonNullable<z.infer<typeof libraryContentSchema>["settings"]>;
export type LibraryContent = z.infer<typeof libraryContentSchema>;
