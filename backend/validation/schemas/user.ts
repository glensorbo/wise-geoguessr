import { z } from 'zod';

export const uuidSchema = z.uuid({ error: 'Must be a valid UUID' });

export const createUserAdminSchema = z
  .object({
    email: z.email('Must be a valid email address'),
    name: z.string().min(1, 'Name is required'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['admin', 'user']).default('user'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });
