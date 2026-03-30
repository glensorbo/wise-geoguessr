import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';

import { DRAWER_WIDTH } from '@frontend/layout/constants';

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
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Home" />
        </ListItemButton>
      </ListItem>
    </List>
  </Drawer>
);
