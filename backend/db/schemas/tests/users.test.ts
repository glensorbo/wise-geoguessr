import { describe, test, expect } from 'bun:test';
import { getTableName } from 'drizzle-orm';

import { users } from '../users';

describe('User Schema', () => {
  test('should have correct table name', () => {
    expect(getTableName(users)).toBe('users');
  });

  test('should have all required columns', () => {
    const columns = Object.keys(users);
    expect(columns).toContain('id');
    expect(columns).toContain('email');
    expect(columns).toContain('password');
    expect(columns).toContain('name');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  test('should have id as primary key', () => {
    expect(users.id.primary).toBe(true);
  });

  test('should have email as unique', () => {
    expect(users.email.isUnique).toBe(true);
  });

  test('should have notNull constraints on required fields', () => {
    expect(users.email.notNull).toBe(true);
    expect(users.password.notNull).toBe(true);
    expect(users.name.notNull).toBe(true);
  });
});
