import { describe, test, expect } from 'bun:test';

import { validateChangePassword } from '../logic/validateChangePassword';

const valid = {
  currentPassword: 'current-password',
  newPassword: 'new-long-password',
  confirmPassword: 'new-long-password',
};

describe('validateChangePassword', () => {
  describe('valid input', () => {
    test('returns an empty errors object for valid input', () => {
      expect(validateChangePassword(valid)).toEqual({});
    });
  });

  describe('currentPassword', () => {
    test('errors when currentPassword is empty', () => {
      const errors = validateChangePassword({ ...valid, currentPassword: '' });
      expect(errors.currentPassword).toBe('Current password is required');
    });

    test('errors when currentPassword is only whitespace', () => {
      const errors = validateChangePassword({
        ...valid,
        currentPassword: '   ',
      });
      expect(errors.currentPassword).toBe('Current password is required');
    });

    test('no error when currentPassword has content', () => {
      const errors = validateChangePassword(valid);
      expect(errors.currentPassword).toBeUndefined();
    });
  });

  describe('newPassword', () => {
    test('errors when newPassword is shorter than 12 characters', () => {
      const errors = validateChangePassword({
        ...valid,
        newPassword: 'short',
        confirmPassword: 'short',
      });
      expect(errors.newPassword).toBe(
        'Password must be at least 12 characters',
      );
    });

    test('errors when newPassword is exactly 11 characters', () => {
      const pw = 'a'.repeat(11);
      const errors = validateChangePassword({
        ...valid,
        newPassword: pw,
        confirmPassword: pw,
      });
      expect(errors.newPassword).toBe(
        'Password must be at least 12 characters',
      );
    });

    test('no error when newPassword is exactly 12 characters', () => {
      const pw = 'a'.repeat(12);
      const errors = validateChangePassword({
        ...valid,
        newPassword: pw,
        confirmPassword: pw,
      });
      expect(errors.newPassword).toBeUndefined();
    });
  });

  describe('confirmPassword', () => {
    test('errors when confirmPassword is empty', () => {
      const errors = validateChangePassword({ ...valid, confirmPassword: '' });
      expect(errors.confirmPassword).toBe('Please confirm your password');
    });

    test('errors when confirmPassword does not match newPassword', () => {
      const errors = validateChangePassword({
        ...valid,
        confirmPassword: 'different-password',
      });
      expect(errors.confirmPassword).toBe('Passwords do not match');
    });

    test('no error when passwords match', () => {
      const errors = validateChangePassword(valid);
      expect(errors.confirmPassword).toBeUndefined();
    });
  });

  describe('multiple errors', () => {
    test('returns errors for all invalid fields simultaneously', () => {
      const errors = validateChangePassword({
        currentPassword: '',
        newPassword: 'short',
        confirmPassword: '',
      });
      expect(errors.currentPassword).toBeTruthy();
      expect(errors.newPassword).toBeTruthy();
      expect(errors.confirmPassword).toBeTruthy();
    });
  });
});
