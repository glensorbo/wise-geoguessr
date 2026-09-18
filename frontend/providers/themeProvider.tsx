import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { buildTheme } from './theme';
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';

import type { RootState } from '@frontend/redux/store';
import type { PaletteMode } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const { trackEvent } = useAnalytics();
  const hasFiredRef = useRef(false);

  const resolvedMode: PaletteMode =
    mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  useEffect(() => {
    if (!hasFiredRef.current) {
      hasFiredRef.current = true;
      trackEvent('theme_loaded', { mode: resolvedMode });
    }
  }, [resolvedMode, trackEvent]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
