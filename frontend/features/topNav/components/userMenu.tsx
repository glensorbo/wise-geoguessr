import DarkModeIcon from '@mui/icons-material/DarkMode';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightModeIcon from '@mui/icons-material/LightMode';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { decodeJwt } from 'jose';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLogout } from '../hooks/useLogout';
import { ChangePasswordModal } from './changePasswordModal';
import { SetPasswordModal } from './setPasswordModal';
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';
import { LoginModal } from '@frontend/features/login/components/loginModal';
import { setThemeMode } from '@frontend/redux/slices/themeSlice';

import type { AppDispatch, RootState } from '@frontend/redux/store';

type ThemeMode = 'system' | 'light' | 'dark';

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  icon: React.ReactElement;
}[] = [
  {
    value: 'system',
    label: 'System',
    icon: <SettingsBrightnessIcon fontSize="small" />,
  },
  { value: 'light', label: 'Light', icon: <LightModeIcon fontSize="small" /> },
  { value: 'dark', label: 'Dark', icon: <DarkModeIcon fontSize="small" /> },
];

export const UserMenu = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logout } = useLogout();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const token = useSelector((state: RootState) => state.auth.token);
  const { trackEvent } = useAnalytics();

  const isSignupToken =
    !!token &&
    (() => {
      try {
        return decodeJwt(token).tokenType === 'signup';
      } catch {
        return false;
      }
    })();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [themeAccordionOpen, setThemeAccordionOpen] = useState(false);

  const menuOpen = Boolean(anchorEl);

  const openMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const closeMenu = () => {
    setAnchorEl(null);
    setThemeAccordionOpen(false);
  };

  const handleThemeModeSelect = (mode: ThemeMode) => {
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

  const passwordMenuItems = token
    ? [
        <MenuItem key="password-action" onClick={handlePasswordAction}>
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
        </MenuItem>,
        <Divider key="password-divider" />,
      ]
    : [];

  return (
    <>
      <IconButton onClick={openMenu} aria-label="Open user menu" size="small">
        <Avatar sx={{ width: 34, height: 34 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 230, mt: 0.5 } } }}
      >
        {/* ── Theme accordion ── */}
        <Accordion
          disableGutters
          elevation={0}
          expanded={themeAccordionOpen}
          onChange={(_, expanded) => setThemeAccordionOpen(expanded)}
          sx={{
            '&::before': { display: 'none' },
            background: 'transparent',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 2,
              minHeight: 42,
              '& .MuiAccordionSummary-content': { my: 0 },
            }}
          >
            <Typography variant="body2">Change theme</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {THEME_OPTIONS.map(({ value, label, icon }) => (
              <MenuItem
                key={value}
                selected={themeMode === value}
                onClick={() => handleThemeModeSelect(value)}
                sx={{ pl: 3 }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </MenuItem>
            ))}
          </AccordionDetails>
        </Accordion>

        {passwordMenuItems}

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
            primary={token ? 'Logout' : 'Login'}
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
    </>
  );
};
