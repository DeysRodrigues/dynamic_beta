import { z } from "zod";

export const presenceEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  daysOfWeek: z.array(z.number()),
  presences: z.array(z.string()),
  absences: z.array(z.string()),
});

export const presenceContentSchema = z.object({
  events: z.array(presenceEventSchema).optional(),
  activeEventId: z.string().optional(),
});

export type PresenceEvent = z.infer<typeof presenceEventSchema>;
export type PresenceContent = z.infer<typeof presenceContentSchema>;
