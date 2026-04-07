import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

import { useSetPassword } from '../hooks/useSetPassword';

interface Props {
  open: boolean;
  onClose: () => void;
}

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

export const SetPasswordModal = ({ open, onClose }: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { submit, isLoading, errors, clearErrors } = useSetPassword();

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
    clearErrors();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await submit(password, confirmPassword);
    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Password</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack sx={{ gap: 2.5 }}>
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={isLoading}>
            Save
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
