import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { setToken } from '@frontend/features/login/state/authSlice';
import { useUpdateUserNameMutation } from '@frontend/redux/api/userApi';

import type { RootState } from '@frontend/redux/store';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentName: string;
}

export const ChangeNameModal = ({
  open,
  onClose,
  userId,
  currentName,
}: Props) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const [updateUserName, { isLoading }] = useUpdateUserNameMutation();

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    if (!token) {
      return;
    }

    try {
      const result = await updateUserName({
        id: userId,
        name: trimmed,
      }).unwrap();
      dispatch(setToken(result.token));
      handleClose();
      navigate(`/players/${encodeURIComponent(result.user.name)}`, {
        replace: true,
      });
    } catch {
      setError('Failed to update name. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Name</DialogTitle>
      <Stack component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current name: <strong>{currentName}</strong>
            </Typography>
            <TextField
              label="New name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error}
              autoFocus
              fullWidth
              slotProps={{ htmlInput: { maxLength: 255 } }}
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
