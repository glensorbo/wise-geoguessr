export type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export const validateChangePassword = (
  values: ChangePasswordValues,
): ChangePasswordErrors => {
  const errors: ChangePasswordErrors = {};

  if (!values.currentPassword.trim()) {
    errors.currentPassword = 'Current password is required';
  }
  if (values.newPassword.length < 12) {
    errors.newPassword = 'Password must be at least 12 characters';
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  }
  if (values.confirmPassword && values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};
