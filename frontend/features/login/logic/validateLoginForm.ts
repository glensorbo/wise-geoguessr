import { setLoginFormErrors } from '../state/loginFormSlice';
import { loginSchema } from './loginSchema';

import type { LoginFormErrors, LoginFormFields } from '../state/loginFormSlice';
import type { AppDispatch } from '@frontend/redux/store';

export const validateLoginForm = (
  dispatch: AppDispatch,
  values: LoginFormFields,
): boolean => {
  const result = loginSchema.safeParse(values);

  if (!result.success) {
    const errors: LoginFormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof LoginFormErrors;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
    dispatch(setLoginFormErrors(errors));
    return false;
  }

  dispatch(setLoginFormErrors({}));
  return true;
};
