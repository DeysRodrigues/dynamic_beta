import { z } from "zod";

export const notepadContentSchema = z.object({
  text: z.string().optional(),
});

export type NotepadContent = z.infer<typeof notepadContentSchema>;
