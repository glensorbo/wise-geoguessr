import { z } from 'zod';

export const addGameResultSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  scores: z
    .record(
      z.string().min(1, 'Player name cannot be empty'),
      z.number().int().min(0),
    )
    .refine((s) => Object.keys(s).length > 0, 'At least one score is required'),
});
