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
            ? { default: '#0d1117', paper: '#161b22' }
            : { default: '#f1f5f9', paper: '#ffffff' },
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ].join(','),
        h3: { fontWeight: 800, letterSpacing: '-0.5px' },
        h4: { fontWeight: 700, letterSpacing: '-0.25px' },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
      },
      components: {
        MuiPaper: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: ({ theme }: { theme: Theme }) => ({
              backgroundImage: 'none',
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(139, 148, 158, 0.15)'
                  : 'rgba(0, 0, 0, 0.07)'
              }`,
            }),
            // elevation-based shadow variants still look polished
            elevation1: {
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.14)',
            },
            elevation4: {
              boxShadow:
                '0 4px 20px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)',
            },
          },
        },

        MuiAppBar: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: ({ theme }: { theme: Theme }) => ({
              backgroundImage: 'none',
              ...(theme.palette.mode === 'dark'
                ? {
                    backgroundColor: '#161b22',
                    borderBottom: '1px solid rgba(139, 148, 158, 0.15)',
                  }
                : {
                    borderBottom: `1px solid rgba(0, 0, 0, 0.07)`,
                  }),
            }),
          },
        },

        MuiDrawer: {
          styleOverrides: {
            paper: ({ theme }: { theme: Theme }) => ({
              backgroundImage: 'none',
              borderRight: `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(139, 148, 158, 0.15)'
                  : 'rgba(0, 0, 0, 0.07)'
              }`,
              // no duplicate border from the global Paper override
              border: 'none',
            }),
          },
        },

        MuiListItemButton: {
          styleOverrides: {
            root: ({ theme }: { theme: Theme }) => ({
              borderRadius: 8,
              transition: 'background-color 150ms ease',
              '&.Mui-selected': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(109, 40, 217, 0.2)'
                    : 'rgba(109, 40, 217, 0.1)',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(109, 40, 217, 0.28)'
                      : 'rgba(109, 40, 217, 0.16)',
                },
              },
            }),
          },
        },

        MuiTableCell: {
          styleOverrides: {
            head: { fontWeight: 700 },
          },
        },

        MuiChip: {
          styleOverrides: {
            root: { fontWeight: 600 },
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
