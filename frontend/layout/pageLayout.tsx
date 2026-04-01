import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router';

import { LeftNav } from '../features/leftNav/components/leftNav';
import { TopNav } from '../features/topNav/components/topNav';
import { toggleDesktopSidebar } from '../redux/slices/sidebarSlice';
import { DRAWER_COLLAPSED_WIDTH, DRAWER_WIDTH } from './constants';

import type { AppDispatch, RootState } from '@frontend/redux/store';

export const PageLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopCollapsed = useSelector(
    (state: RootState) => state.sidebar.desktopCollapsed,
  );

  useEffect(() => {
    if (isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop]);

  const drawerWidth = desktopCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleMenuClick = () => {
    if (isDesktop) {
      dispatch(toggleDesktopSidebar());
      return;
    }

    setMobileOpen((current) => !current);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <TopNav
        drawerWidth={drawerWidth}
        isDesktop={isDesktop}
        isSidebarCollapsed={desktopCollapsed}
        onMenuClick={handleMenuClick}
      />
      <LeftNav
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={desktopCollapsed}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ pb: { xs: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
