import { z } from "zod";

export const bookItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  current: z.number(),
  total: z.number(),
  color: z.string(),
});

export const bookTrackerContentSchema = z.object({
  books: z.array(bookItemSchema).optional(),
  settings: z.object({ pageStep: z.number() }).optional(),
});

export type BookItem = z.infer<typeof bookItemSchema>;
export type BookTrackerContent = z.infer<typeof bookTrackerContentSchema>;
