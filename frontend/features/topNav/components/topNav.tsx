import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { UserMenu } from './userMenu';
import { AddScoreModal } from '@frontend/features/geoguessr/components/addScoreModal';
import { LoginModal } from '@frontend/features/login/components/loginModal';

import type { RootState } from '@frontend/redux/store';

type TopNavProps = {
  drawerWidth: number;
  isDesktop: boolean;
  isSidebarCollapsed: boolean;
  onMenuClick: () => void;
};

export const TopNav = ({
  drawerWidth,
  isDesktop,
  isSidebarCollapsed,
  onMenuClick,
}: TopNavProps) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [addScoreOpen, setAddScoreOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: isDesktop ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: isDesktop ? `${drawerWidth}px` : 0,
        }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 64, sm: 64 } }}>
          <IconButton
            color="inherit"
            onClick={onMenuClick}
            edge="start"
            aria-label={
              isDesktop
                ? isSidebarCollapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
                : 'Open navigation'
            }
            sx={{ flexShrink: 0 }}
          >
            {isDesktop && !isSidebarCollapsed ? (
              <MenuOpenRoundedIcon />
            ) : (
              <MenuRoundedIcon />
            )}
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            🌍 Wise GeoGuessr
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {token ? (
              <>
                <Button
                  color="inherit"
                  variant="outlined"
                  size="small"
                  onClick={() => setAddScoreOpen(true)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    px: { xs: 1.25, sm: 1.75 },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isPhone ? '+ Add' : '+ Add results'}
                </Button>
                <UserMenu />
              </>
            ) : (
              <Button
                color="inherit"
                variant="outlined"
                size="small"
                onClick={() => setLoginOpen(true)}
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <AddScoreModal
        open={addScoreOpen}
        onClose={() => setAddScoreOpen(false)}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};
