import { createTheme } from '@mui/material';

import type { PaletteMode, Theme } from '@mui/material';

/**
 * Builds a MUI theme for a resolved light/dark mode.
 * Customise palette, typography, shape, components, etc. here.
 * This function always receives a concrete 'light' | 'dark' value —
 * system preference resolution happens in ThemeProvider before this is called.
 */
export const buildTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#1976d2' },
            background: { default: '#f5f5f5', paper: '#ffffff' },
          }
        : {
            primary: { main: '#90caf9' },
            background: { default: '#121212', paper: '#1e1e1e' },
          }),
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: ({ theme }: { theme: Theme }) => ({
            '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus':
              {
                WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
                WebkitTextFillColor: theme.palette.text.primary,
                caretColor: theme.palette.text.primary,
              },
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          // When the label is shrunk (field has a value) but NOT focused,
          // use a neutral colour instead of primary (blue).
          shrink: ({ theme }: { theme: Theme }) => ({
            color: theme.palette.text.secondary,
            '&.Mui-focused': {
              color: theme.palette.primary.main,
            },
          }),
        },
      },
    },
  });
