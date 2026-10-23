import { z } from 'zod';

export const MAX_MESSAGE_LENGTH = 1000;

export const assistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  hint_level: z.number().int().min(1).max(3).default(1),
  exercise_id: z.uuid().optional(),
  simulation_id: z.uuid().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['student', 'assistant']),
        content: z.string().max(MAX_MESSAGE_LENGTH),
      }),
    )
    .max(6)
    .default([]),
});
