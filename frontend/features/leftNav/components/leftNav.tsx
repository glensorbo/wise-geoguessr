import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link, useMatch, useResolvedPath } from 'react-router';

import {
  DRAWER_COLLAPSED_WIDTH,
  DRAWER_WIDTH,
} from '@frontend/layout/constants';

import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ComponentType } from 'react';

type NavItemProps = {
  to: string;
  label: string;
  Icon: ComponentType<SvgIconProps>;
  end?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
};

const NavItem = ({
  to,
  label,
  Icon,
  end = false,
  collapsed = false,
  onNavigate,
}: NavItemProps) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end });
  const button = (
    <ListItemButton
      component={Link}
      to={to}
      selected={!!match}
      onClick={onNavigate}
      sx={{
        minHeight: 48,
        justifyContent: collapsed ? 'center' : 'flex-start',
        px: collapsed ? 1.5 : 2,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: collapsed ? 0 : 1.5,
          justifyContent: 'center',
        }}
      >
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={label}
        sx={{
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : 'auto',
          whiteSpace: 'nowrap',
        }}
      />
    </ListItemButton>
  );

  return (
    <ListItem disablePadding>
      {collapsed ? (
        <Tooltip title={label} placement="right">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </ListItem>
  );
};

type LeftNavProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
};

const drawerPaperStyles = (collapsed: boolean) => ({
  width: collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH,
  boxSizing: 'border-box',
  overflowX: 'hidden',
});

const DrawerContent = ({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) => (
  <>
    <Toolbar
      disableGutters
      sx={{
        px: collapsed ? 1 : 2,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      <Typography
        component={Link}
        to="/"
        onClick={onNavigate}
        variant="h6"
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 1,
          width: '100%',
        }}
      >
        <Box component="span" aria-hidden="true">
          🌍
        </Box>
        {!collapsed && <Box component="span">Wise GeoGuessr</Box>}
      </Typography>
    </Toolbar>
    <Divider />
    <Box component="nav" aria-label="Main navigation" sx={{ py: 1 }}>
      <List>
        <NavItem
          to="/"
          label="Dashboard"
          Icon={HomeRoundedIcon}
          end
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/results"
          label="Results"
          Icon={TableChartRoundedIcon}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/stats"
          label="Statistics"
          Icon={BarChartRoundedIcon}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/hall-of-fame"
          label="Hall of Fame"
          Icon={EmojiEventsRoundedIcon}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/head-to-head"
          label="Head-to-Head"
          Icon={CompareArrowsRoundedIcon}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </List>
    </Box>
  </>
);

export const LeftNav = ({
  mobileOpen,
  onMobileClose,
  collapsed,
}: LeftNavProps) => (
  <Box
    component="aside"
    aria-label="Sidebar"
    sx={{
      width: { md: collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH },
      flexShrink: { md: 0 },
    }}
  >
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': drawerPaperStyles(false),
      }}
    >
      <DrawerContent collapsed={false} onNavigate={onMobileClose} />
    </Drawer>

    <Drawer
      variant="permanent"
      open
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': (theme) => ({
          ...drawerPaperStyles(collapsed),
          transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.standard,
          }),
        }),
      }}
    >
      <DrawerContent collapsed={collapsed} />
    </Drawer>
  </Box>
);
