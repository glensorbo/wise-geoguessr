import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { validateChangePassword } from '../logic/validateChangePassword';
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';
import { setToken } from '@frontend/features/login/state/authSlice';
import { useChangePasswordMutation } from '@frontend/redux/api/authApi';

import type {
  ChangePasswordErrors,
  ChangePasswordValues,
} from '../logic/validateChangePassword';
import type { AppDispatch } from '@frontend/redux/store';

export const useChangePassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [changePasswordMutation, { isLoading }] = useChangePasswordMutation();
  const { trackEvent } = useAnalytics();

  const clearErrors = () => {
    setErrors({});
  };

  const submit = async (values: ChangePasswordValues): Promise<boolean> => {
    trackEvent('change_password_submitted');

    const validationErrors = validateChangePassword(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    if (values.newPassword !== values.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return false;
    }

    clearErrors();

    const result = await changePasswordMutation({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });

    if ('error' in result) {
      const reason =
        result.error?.message ?? 'Failed to change password. Please try again.';
      trackEvent('change_password_failed', { reason });
      toast.error(reason);
      return false;
    }

    trackEvent('change_password_success');
    dispatch(setToken(result.data.token));
    toast.success('Password changed successfully! 🔒');
    return true;
  };

  return { submit, isLoading, errors, clearErrors };
};
