import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

import { setRememberedEmail, setToken } from '../state/authSlice';
import { clearLoginForm } from '../state/loginFormSlice';
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';
import { useLoginMutation } from '@frontend/redux/api/authApi';

import type { LoginFormValues } from '../logic/loginSchema';
import type { AppDispatch } from '@frontend/redux/store';

export const useLogin = (onSuccess?: () => void) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const { trackEvent } = useAnalytics();

  const submit = async (values: LoginFormValues) => {
    trackEvent('login_submitted');

    const result = await loginMutation({
      email: values.email,
      password: values.password,
    });

    if ('error' in result) {
      const reason = result.error?.message ?? 'Login failed. Please try again.';
      trackEvent('login_failed', { reason });
      toast.error(reason);
      return;
    }

    trackEvent('login_success', { rememberMe: values.rememberMe });
    dispatch(setToken(result.data.token));
    dispatch(setRememberedEmail(values.rememberMe ? values.email : null));
    dispatch(clearLoginForm());
    toast.success('Welcome back! 👋');
    if (onSuccess) {
      onSuccess();
    } else {
      void navigate('/');
    }
  };

  return { submit, isLoading };
};
