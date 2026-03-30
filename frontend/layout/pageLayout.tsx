import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router';

import { LeftNav } from '../features/leftNav/components/leftNav';
import { TopNav } from '../features/topNav/components/topNav';
import { DRAWER_WIDTH } from './constants';

export const PageLayout = () => (
  <Box sx={{ display: 'flex' }}>
    <TopNav />
    <LeftNav />
    <Box
      component="main"
      sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${DRAWER_WIDTH}px)` }}
    >
      <Toolbar />
      <Outlet />
    </Box>
  </Box>
);
