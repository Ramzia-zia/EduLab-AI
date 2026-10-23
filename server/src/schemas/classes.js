import { z } from 'zod';

export const createClassBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  grade_level: z.string().trim().max(40).optional(),
});

export const joinClassBodySchema = z.object({
  code: z.string().trim().min(4).max(12),
});

export const classIdParamsSchema = z.object({ id: z.uuid() });
