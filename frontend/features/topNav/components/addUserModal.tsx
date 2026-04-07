import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { useCreateUserMutation } from '@frontend/redux/api/userApi';

interface Props {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM = {
  email: '',
  name: '',
  role: 'user' as 'admin' | 'user',
};

export const AddUserModal = ({ open, onClose }: Props) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof EMPTY_FORM, string>>
  >({});
  const [signupLink, setSignupLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [createUser, { isLoading }] = useCreateUserMutation();

  const set =
    (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSignupLink(null);
    setCopied(false);
    onClose();
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
    if (!form.email) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Must be a valid email address';
    }
    if (!form.name) {
      next.name = 'Name is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCopy = async () => {
    if (!signupLink) {
      return;
    }
    await navigator.clipboard.writeText(signupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      const result = await createUser(form).unwrap();
      if (result.mailSent) {
        toast.success(`✅ Invite sent to ${form.email}`);
        handleClose();
      } else {
        setSignupLink(result.signupLink);
      }
    } catch (err: unknown) {
      const apiErr = err as {
        error?: { errors?: { field?: string; message?: string }[] };
      };
      const fieldErrors = apiErr?.error?.errors ?? [];
      if (fieldErrors.length > 0) {
        const next: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
        for (const fe of fieldErrors) {
          if (fe.field && fe.field in EMPTY_FORM) {
            next[fe.field as keyof typeof EMPTY_FORM] =
              fe.message ?? 'Invalid value';
          }
        }
        if (Object.keys(next).length > 0) {
          setErrors(next);
          return;
        }
      }
      toast.error('Failed to create user');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add User</DialogTitle>
      {signupLink ? (
        <>
          <DialogContent>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="body2">
                Mail is not configured — share this invite link with{' '}
                <strong>{form.email}</strong>. It expires in{' '}
                <strong>1 hour</strong>.
              </Typography>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Invite link</InputLabel>
                <OutlinedInput
                  label="Invite link"
                  value={signupLink}
                  readOnly
                  endAdornment={
                    <InputAdornment position="end">
                      <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                        <IconButton
                          onClick={handleCopy}
                          edge="end"
                          size="small"
                        >
                          {copied ? (
                            <CheckIcon fontSize="small" color="success" />
                          ) : (
                            <ContentCopyIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleClose}>
              Done
            </Button>
          </DialogActions>
        </>
      ) : (
        <Stack component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack sx={{ gap: 2.5 }}>
              <TextField
                label="Email"
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={set('email')}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
              />
              <TextField
                label="Name"
                autoComplete="off"
                value={form.name}
                onChange={set('name')}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="add-user-role-label">Role</InputLabel>
                <Select
                  labelId="add-user-role-label"
                  label="Role"
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value as 'admin' | 'user',
                    }))
                  }
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={isLoading}>
              Add User
            </Button>
          </DialogActions>
        </Stack>
      )}
    </Dialog>
  );
};
