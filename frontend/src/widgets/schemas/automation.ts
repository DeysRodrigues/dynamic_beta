import { z } from "zod";

export const triggerTypeSchema = z.enum(["time", "tasks", "interval"]);
export const actionTypeSchema = z.enum([
  "sound", "media", "notify", "alert", "theme", "link", "clear_done", "clear_all", "backup",
]);

export const automationRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger: triggerTypeSchema,
  triggerValue: z.string(),
  action: actionTypeSchema,
  actionValue: z.string(),
  lastRun: z.number().optional(),
  active: z.boolean(),
});

export const automationContentSchema = z.object({
  rules: z.array(automationRuleSchema).optional(),
});

export type TriggerType = z.infer<typeof triggerTypeSchema>;
export type ActionType = z.infer<typeof actionTypeSchema>;
export type AutomationRule = z.infer<typeof automationRuleSchema>;
export type AutomationContent = z.infer<typeof automationContentSchema>;
