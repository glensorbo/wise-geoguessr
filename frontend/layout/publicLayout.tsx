import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router';

import { TopNav } from '../features/topNav/components/topNav';

export const PublicLayout = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <TopNav />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Toolbar />
      <Outlet />
    </Box>
  </Box>
);
