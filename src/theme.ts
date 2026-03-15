import {
  createTheme,
  type PaletteMode,
  responsiveFontSizes,
} from '@mui/material/styles';

export const createAppTheme = (mode: PaletteMode) => {
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#6d28d9',
      },
      secondary: {
        main: '#2563eb',
      },
      background:
        mode === 'dark'
          ? {
              default: '#0f172a',
              paper: '#111827',
            }
          : {
              default: '#f8fafc',
              paper: '#ffffff',
            },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
};
