import DarkModeIcon from '@mui/icons-material/DarkMode';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightModeIcon from '@mui/icons-material/LightMode';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { decodeJwt } from 'jose';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLogout } from '../hooks/useLogout';
import { AddUserModal } from './addUserModal';
import { ChangePasswordModal } from './changePasswordModal';
import { SetPasswordModal } from './setPasswordModal';
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';
import { LoginModal } from '@frontend/features/login/components/loginModal';
import { setThemeMode } from '@frontend/redux/slices/themeSlice';
import { PlayerAvatar } from '@frontend/shared/components/playerAvatar';

import type { AppDispatch, RootState } from '@frontend/redux/store';

type ThemeMode = 'system' | 'light' | 'dark';

export const UserMenu = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logout } = useLogout();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const token = useSelector((state: RootState) => state.auth.token);
  const { trackEvent } = useAnalytics();

  const [guestSeed] = useState(() => {
    const key = 'guest-avatar-seed';
    const stored = localStorage.getItem(key);
    if (stored) {
      return stored;
    }
    const seed = crypto.randomUUID();
    localStorage.setItem(key, seed);
    return seed;
  });

  const decoded = (() => {
    if (!token) {
      return null;
    }
    try {
      return decodeJwt(token);
    } catch {
      return null;
    }
  })();

  const email = (decoded?.email as string | undefined) ?? '';
  const displayName =
    (decoded?.name as string | undefined) || email.split('@')[0] || 'Guest';
  const role = (decoded?.role as string | undefined) ?? '';
  const avatarSeed = email || guestSeed;

  const isSignupToken = decoded?.tokenType === 'signup';
  const isAdmin = decoded?.role === 'admin';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const menuOpen = Boolean(anchorEl);

  const openMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const closeMenu = () => setAnchorEl(null);

  const handleThemeModeSelect = (
    _: React.MouseEvent<HTMLElement>,
    mode: ThemeMode | null,
  ) => {
    if (!mode) {
      return;
    }
    trackEvent('theme_changed', { mode });
    dispatch(setThemeMode(mode));
  };

  const handlePasswordAction = () => {
    closeMenu();
    if (isSignupToken) {
      setSetPasswordOpen(true);
    } else {
      setChangePasswordOpen(true);
    }
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const handleLogin = () => {
    closeMenu();
    setLoginOpen(true);
  };

  const handleAddUser = () => {
    closeMenu();
    setAddUserOpen(true);
  };

  return (
    <>
      {/* ── Glassmorphic pill trigger ── */}
      <Button
        onClick={openMenu}
        aria-label="Open user menu"
        size="small"
        sx={(theme) => ({
          borderRadius: 99,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'inherit',
          gap: 0.75,
          px: 1.25,
          py: 0.5,
          textTransform: 'none',
          minWidth: 0,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.18)',
          },
          [theme.breakpoints.down('sm')]: {
            px: 0.75,
          },
        })}
      >
        <PlayerAvatar name={avatarSeed} size={28} />
        {token && (
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 500, maxWidth: 120 }}
          >
            {displayName}
          </Typography>
        )}
        {token && role && (
          <Typography
            variant="caption"
            noWrap
            sx={{
              opacity: 0.75,
              display: { xs: 'none', sm: 'block' },
              textTransform: 'capitalize',
            }}
          >
            {role}
          </Typography>
        )}
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            transition: 'transform 0.2s',
            transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 240, mt: 0.5 } } }}
      >
        {/* ── Profile header ── */}
        {token && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <PlayerAvatar name={avatarSeed} size={44} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {displayName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
              >
                {email}
              </Typography>
              {role && (
                <Chip
                  label={role}
                  size="small"
                  color={isAdmin ? 'warning' : 'default'}
                  sx={{
                    mt: 0.5,
                    height: 18,
                    fontSize: '0.65rem',
                    textTransform: 'capitalize',
                  }}
                />
              )}
            </Box>
          </Box>
        )}
        {token && <Divider />}

        {/* ── Inline theme toggle ── */}
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Theme
          </Typography>
          <ToggleButtonGroup
            value={themeMode}
            exclusive
            onChange={handleThemeModeSelect}
            size="small"
            aria-label="Theme"
          >
            <Tooltip title="System">
              <ToggleButton value="system" aria-label="System theme">
                <SettingsBrightnessIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Light">
              <ToggleButton value="light" aria-label="Light theme">
                <LightModeIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Dark">
              <ToggleButton value="dark" aria-label="Dark theme">
                <DarkModeIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {token && (
          <MenuItem onClick={handlePasswordAction}>
            <ListItemIcon>
              {isSignupToken ? (
                <LockOpenIcon fontSize="small" />
              ) : (
                <LockIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={isSignupToken ? 'Set password' : 'Change password'}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
        )}
        {token && <Divider />}

        {isAdmin && (
          <MenuItem onClick={handleAddUser}>
            <ListItemIcon>
              <PersonAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Add user"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
        )}
        {isAdmin && <Divider />}

        <MenuItem
          data-highlight-tone={token ? 'danger' : 'primary'}
          onClick={token ? handleLogout : handleLogin}
          sx={(theme) => ({
            backgroundColor: token
              ? theme.palette.error.main
              : theme.palette.primary.main,
            color: token
              ? theme.palette.error.contrastText
              : theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: token
                ? theme.palette.error.dark
                : theme.palette.primary.dark,
            },
            '& .MuiListItemIcon-root': {
              color: 'inherit',
            },
          })}
        >
          <ListItemIcon>
            {token ? (
              <LogoutIcon fontSize="small" />
            ) : (
              <LoginIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={token ? 'Sign out' : 'Login'}
            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
          />
        </MenuItem>
      </Menu>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <SetPasswordModal
        open={setPasswordOpen}
        onClose={() => setSetPasswordOpen(false)}
      />
      <AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} />
    </>
  );
};
