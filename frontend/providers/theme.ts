import { createTheme, responsiveFontSizes } from '@mui/material';

import type { PaletteMode, Theme } from '@mui/material';

/**
 * Builds a MUI theme for a resolved light/dark mode.
 * Customise palette, typography, shape, components, etc. here.
 * This function always receives a concrete 'light' | 'dark' value —
 * system preference resolution happens in ThemeProvider before this is called.
 */
export const buildTheme = (mode: PaletteMode) =>
  responsiveFontSizes(
    createTheme({
      palette: {
        mode,
        primary: { main: '#6d28d9' },
        secondary: { main: '#2563eb' },
        background:
          mode === 'dark'
            ? { default: '#0f172a', paper: '#111827' }
            : { default: '#f8fafc', paper: '#ffffff' },
      },
      shape: { borderRadius: 16 },
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
        MuiPaper: {
          styleOverrides: {
            root: { backgroundImage: 'none' },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            head: { fontWeight: 700 },
          },
        },
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
            shrink: ({ theme }: { theme: Theme }) => ({
              color: theme.palette.text.secondary,
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            }),
          },
        },
      },
    }),
  );
