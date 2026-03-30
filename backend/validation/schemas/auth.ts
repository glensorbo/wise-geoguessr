import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.email('Must be a valid email address'),
  name: z.string().min(1, 'name is required'),
});

export const loginSchema = z.object({
  email: z.email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const setPasswordSchema = z
  .object({
    password: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });
