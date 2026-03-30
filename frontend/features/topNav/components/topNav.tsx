import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { UserMenu } from './userMenu';
import { AddScoreModal } from '@frontend/features/geoguessr/components/addScoreModal';

import type { RootState } from '@frontend/redux/store';

export const TopNav = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [addScoreOpen, setAddScoreOpen] = useState(false);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
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
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', mr: 1 }}
                >
                  + Add results
                </Button>
                <UserMenu />
              </>
            ) : (
              <Button
                component={Link}
                to="/login"
                color="inherit"
                variant="outlined"
                size="small"
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
    </>
  );
};
