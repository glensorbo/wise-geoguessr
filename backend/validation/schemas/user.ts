import { z } from 'zod';

export const uuidSchema = z.uuid({ error: 'Must be a valid UUID' });
