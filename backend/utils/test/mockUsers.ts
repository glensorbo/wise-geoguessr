import dayjs from 'dayjs';

import type { NewUser } from '@backend/types/newUser';

export const mockUsers: NewUser[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john@example.com',
    name: 'John Doe',
    password: 'hashed_password_123',
    role: 'user',
    createdAt: dayjs('2024-01-01T00:00:00Z').toISOString(),
    updatedAt: dayjs('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'jane@example.com',
    name: 'Jane Smith',
    password: 'hashed_password_456',
    role: 'user',
    createdAt: dayjs('2024-01-02T00:00:00Z').toISOString(),
    updatedAt: dayjs('2024-01-02T00:00:00Z').toISOString(),
  },
];
