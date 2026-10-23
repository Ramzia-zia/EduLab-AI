import { z } from 'zod';

const attemptSchema = z
  .object({
    id: z.uuid(),
    exercise_id: z.uuid().nullish(),
    simulation_id: z.uuid().nullish(),
    score: z.number().min(0).max(100),
    duration_seconds: z.number().int().min(0).max(86_400).nullish(),
    payload: z.record(z.string(), z.unknown()).default({}),
    completed_at: z.string().datetime({ offset: true }),
  })
  .refine((attempt) => attempt.exercise_id || attempt.simulation_id, {
    message: 'exercise_id ou simulation_id est requis.',
    path: ['exercise_id'],
  });

export const syncAttemptsBodySchema = z.object({
  attempts: z.array(attemptSchema).min(1).max(100),
});
