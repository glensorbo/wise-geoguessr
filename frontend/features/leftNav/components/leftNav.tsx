import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import type { ComponentType, SVGProps } from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router';

import { DRAWER_WIDTH } from '@frontend/layout/constants';

type NavItemProps = {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
};

const NavItem = ({ to, label, Icon, end = false }: NavItemProps) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end });

  return (
    <ListItem disablePadding>
      <ListItemButton component={Link} to={to} selected={!!match}>
        <ListItemIcon sx={{ minWidth: 36 }}>
          <Icon width={20} height={20} />
        </ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );
};

export const LeftNav = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: DRAWER_WIDTH,
      flexShrink: 0,
      '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
    }}
  >
    <Toolbar />
    <Divider />
    <List>
      <NavItem to="/" label="Dashboard" Icon={HomeRoundedIcon} end />
      <NavItem to="/results" label="Results" Icon={TableChartRoundedIcon} />
      <NavItem to="/stats" label="Statistics" Icon={BarChartRoundedIcon} />
    </List>
  </Drawer>
);
