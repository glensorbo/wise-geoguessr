import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { decodeJwt } from 'jose';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { UserTable } from '@frontend/features/admin/components/userTable';
import { AddUserModal } from '@frontend/features/topNav/components/addUserModal';

import type { RootState } from '@frontend/redux/store';

export const AdminPage = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const decoded = token
    ? (() => {
        try {
          return decodeJwt(token);
        } catch {
          return null;
        }
      })()
    : null;

  const isAdmin = decoded?.role === 'admin';

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Access denied
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          You need admin privileges to view this page.
        </Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          Go home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminPanelSettingsRoundedIcon color="warning" />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              User Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => setAddUserOpen(true)}
          >
            Add user
          </Button>
        </Stack>

        <UserTable />
      </Stack>

      <AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} />
    </Container>
  );
};
