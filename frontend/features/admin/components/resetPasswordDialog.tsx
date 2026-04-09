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
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { useAnalytics } from '@frontend/features/analytics/useAnalytics';
import { useResetUserPasswordMutation } from '@frontend/redux/api/userApi';

import type { User } from '@backend/types/user';

type Props = {
  user: User | null;
  onClose: () => void;
};

export const ResetPasswordDialog = ({ user, onClose }: Props) => {
  const [signupLink, setSignupLink] = useState<string | null>(null);
  const [mailConfigured, setMailConfigured] = useState(false);
  const [copied, setCopied] = useState(false);

  const [resetPassword, { isLoading }] = useResetUserPasswordMutation();
  const { trackEvent } = useAnalytics();

  const handleConfirm = async () => {
    if (!user?.id) {
      return;
    }
    try {
      const result = await resetPassword(user.id).unwrap();
      if (result.mailSent) {
        toast.success(`📧 Password reset email sent to ${user.email}`);
        trackEvent('admin_password_reset', { method: 'email' });
        handleClose();
      } else {
        setSignupLink(result.signupLink);
        setMailConfigured(result.mailConfigured);
        trackEvent('admin_password_reset', { method: 'link' });
      }
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const handleCopy = async () => {
    if (!signupLink) {
      return;
    }
    await navigator.clipboard.writeText(signupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSignupLink(null);
    setMailConfigured(false);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={!!user} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reset password</DialogTitle>
      {signupLink ? (
        <>
          <DialogContent>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="body2">
                {mailConfigured
                  ? 'Failed to send reset email — share this link with '
                  : 'Mail is not configured — share this reset link with '}
                <strong>{user?.name}</strong>. It expires in{' '}
                <strong>1 hour</strong>.
              </Typography>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Reset link</InputLabel>
                <OutlinedInput
                  label="Reset link"
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
        <>
          <DialogContent>
            <Typography variant="body2">
              This will generate a new password reset link for{' '}
              <strong>{user?.name}</strong> ({user?.email}). Their current
              password will be invalidated immediately.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              loading={isLoading}
              onClick={handleConfirm}
            >
              Reset password
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
