import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLogin } from '../hooks/useLogin';
import { validateLoginForm } from '../logic/validateLoginForm';
import { setLoginFormField, setLoginFormErrors } from '../state/loginFormSlice';

import type { LoginFormFields } from '../state/loginFormSlice';
import type { AppDispatch, RootState } from '@frontend/redux/store';
import type { ChangeEvent } from 'react';

export const LoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const rememberedEmail = useSelector(
    (state: RootState) => state.auth.rememberedEmail,
  );
  const { email, password, rememberMe, errors } = useSelector(
    (state: RootState) => state.loginForm,
  );
  const { submit, isLoading } = useLogin(onSuccess);
  const [showPassword, setShowPassword] = useState(false);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && rememberedEmail) {
      dispatch(setLoginFormField({ email: rememberedEmail, rememberMe: true }));
      initialized.current = true;
    }
  }, [dispatch, rememberedEmail]);

  const onChangeHandler =
    (field: keyof LoginFormFields) => (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        setLoginFormField({
          [field]:
            e.target.type === 'checkbox' ? e.target.checked : e.target.value,
        }),
      );
      if (errors[field]) {
        dispatch(setLoginFormErrors({ ...errors, [field]: undefined }));
      }
    };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = { email, password, rememberMe };
    if (!validateLoginForm(dispatch, values)) {
      return;
    }
    await submit(values);
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmitHandler}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
        Sign in
      </Typography>

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={onChangeHandler('email')}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
      />

      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={password}
        onChange={onChangeHandler('password')}
        error={!!errors.password}
        helperText={errors.password}
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={onChangeHandler('rememberMe')}
            />
          }
          label="Remember me"
        />
        {errors.rememberMe && (
          <FormHelperText error>{errors.rememberMe}</FormHelperText>
        )}
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={isLoading}
        fullWidth
      >
        Sign in
      </Button>
    </Box>
  );
};
