import { z } from 'zod';

export const uuidSchema = z.uuid({ error: 'Must be a valid UUID' });

export const createUserAdminSchema = z.object({
  email: z.email('Must be a valid email address'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'user']).default('user'),
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'user']),
});
