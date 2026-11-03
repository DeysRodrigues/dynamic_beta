import { z } from "zod";

export const notepadContentSchema = z.object({
  text: z.string().optional(),
  /** Which side of the note is showing. Notes are markdown, so they can be previewed. */
  view: z.enum(["edit", "preview"]).optional(),
});

export type NotepadContent = z.infer<typeof notepadContentSchema>;
