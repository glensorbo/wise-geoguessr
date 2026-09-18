import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { toast } from 'react-toastify';

import { useAnalytics } from '@frontend/features/analytics/useAnalytics';
import { useDeleteUserMutation } from '@frontend/redux/api/userApi';

import type { User } from '@backend/types/user';

type Props = {
  user: User | null;
  onClose: () => void;
};

export const DeleteUserDialog = ({ user, onClose }: Props) => {
  const [deleteUser, { isLoading }] = useDeleteUserMutation();
  const { trackEvent } = useAnalytics();

  const handleConfirm = async () => {
    if (!user?.id) {
      return;
    }
    try {
      await deleteUser(user.id).unwrap();
      toast.success(`🗑️ ${user.name} deleted`);
      trackEvent('user_deleted');
      onClose();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <Dialog open={!!user} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete user</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to permanently delete{' '}
          <strong>{user?.name}</strong> ({user?.email})? This cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          loading={isLoading}
          onClick={handleConfirm}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
