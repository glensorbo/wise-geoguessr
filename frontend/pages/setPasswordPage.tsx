import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';

import { setToken } from '@frontend/features/login/state/authSlice';
import { useSetPassword } from '@frontend/features/topNav/hooks/useSetPassword';

import type { AppDispatch } from '@frontend/redux/store';

const EyeToggle = ({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) => (
  <InputAdornment position="end">
    <IconButton
      aria-label={visible ? 'Hide password' : 'Show password'}
      onClick={onToggle}
      edge="end"
    >
      {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
    </IconButton>
  </InputAdornment>
);

export const SetPasswordPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { submit, isLoading, errors } = useSetPassword();

  useEffect(() => {
    if (token) {
      dispatch(setToken(token));
    }
  }, [token, dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await submit(password, confirmPassword);
    if (success) {
      void navigate('/', { replace: true });
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 440, p: 1 }}>
          <CardContent>
            <Stack gap={2} alignItems="center" textAlign="center">
              <Typography variant="h6">Invalid invite link</Typography>
              <Typography variant="body2" color="text.secondary">
                This link is missing a token. Please use the invite link you
                received, or ask an admin to send a new one.
              </Typography>
              <Button variant="contained" onClick={() => void navigate('/')}>
                Go to home
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440, p: 1 }}>
        <CardContent>
          <Stack component="form" onSubmit={handleSubmit} gap={3}>
            <Stack gap={0.5}>
              <Typography variant="h5" fontWeight={600}>
                Set your password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a password for your account. It must be at least 12
                characters.
              </Typography>
            </Stack>

            <Stack gap={2.5}>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <EyeToggle
                        visible={showPassword}
                        onToggle={() => setShowPassword((p) => !p)}
                      />
                    ),
                  },
                }}
              />
              <TextField
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <EyeToggle
                        visible={showConfirm}
                        onToggle={() => setShowConfirm((p) => !p)}
                      />
                    ),
                  },
                }}
              />
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              loading={isLoading}
              fullWidth
            >
              Set password
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
