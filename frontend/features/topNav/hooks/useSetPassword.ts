import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { useAnalytics } from '@frontend/features/analytics/useAnalytics';
import { setToken } from '@frontend/features/login/state/authSlice';
import { useSetPasswordMutation } from '@frontend/redux/api/authApi';

import type { AppDispatch } from '@frontend/redux/store';

type Errors = {
  password?: string;
  confirmPassword?: string;
};

const validate = (password: string, confirmPassword: string): Errors => {
  const errors: Errors = {};

  if (password.length < 12) {
    errors.password = 'Password must be at least 12 characters';
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  }
  if (confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const useSetPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [errors, setErrors] = useState<Errors>({});
  const [setPasswordMutation, { isLoading }] = useSetPasswordMutation();
  const { trackEvent } = useAnalytics();

  const clearErrors = () => setErrors({});

  const submit = async (
    password: string,
    confirmPassword: string,
  ): Promise<boolean> => {
    trackEvent('set_password_submitted');

    const validationErrors = validate(password, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return false;
    }

    clearErrors();

    const result = await setPasswordMutation({ password, confirmPassword });

    if ('error' in result) {
      const reason =
        result.error?.message ?? 'Failed to set password. Please try again.';
      trackEvent('set_password_failed', { reason });
      toast.error(reason);
      return false;
    }

    trackEvent('set_password_success');
    dispatch(setToken(result.data.token));
    toast.success('Password set successfully! 🔒');
    return true;
  };

  return { submit, isLoading, errors, clearErrors };
};
