import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockResetIcon from '@mui/icons-material/LockReset';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { decodeJwt } from 'jose';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DeleteUserDialog } from './deleteUserDialog';
import { ResetPasswordDialog } from './resetPasswordDialog';
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from '@frontend/redux/api/userApi';
import { TableSkeleton } from '@frontend/shared/components/skeleton';
import { formatDate } from '@frontend/shared/utils/formatDate';

import type { User } from '@backend/types/user';
import type { RootState } from '@frontend/redux/store';

export const UserTable = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const [updateRole] = useUpdateUserRoleMutation();
  const { trackEvent } = useAnalytics();

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);
  const currentUserId = token ? (decodeJwt(token).sub as string) : null;

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateRole({ id: user.id!, role: newRole }).unwrap();
      toast.success(`✅ ${user.name} is now ${newRole}`);
      trackEvent('user_role_changed', { new_role: newRole });
    } catch {
      toast.error('Failed to update role');
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  if (isError) {
    return (
      <Typography color="error" variant="body2">
        Failed to load users.
      </Typography>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        isSelf
                          ? 'Cannot change your own role'
                          : `Switch to ${user.role === 'admin' ? 'user' : 'admin'}`
                      }
                    >
                      <span>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'admin' ? 'warning' : 'default'}
                          onClick={
                            isSelf ? undefined : () => handleRoleToggle(user)
                          }
                          clickable={!isSelf}
                          sx={{
                            textTransform: 'capitalize',
                            cursor: isSelf ? 'default' : 'pointer',
                          }}
                        />
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Reset password">
                      <IconButton
                        size="small"
                        onClick={() => setResetTarget(user)}
                        aria-label={`Reset password for ${user.name}`}
                      >
                        <LockResetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                    >
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isSelf}
                          onClick={() => setDeleteTarget(user)}
                          aria-label={`Delete ${user.name}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteUserDialog
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
      <ResetPasswordDialog
        user={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </Box>
  );
};
