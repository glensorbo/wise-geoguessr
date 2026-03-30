import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';

export const NotFoundPage = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      gap: 2,
    }}
  >
    <Typography
      component="p"
      sx={{
        fontSize: 'clamp(7rem, 22vw, 14rem)',
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        userSelect: 'none',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark ?? theme.palette.primary.main} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      404
    </Typography>

    <Typography variant="h4" fontWeight={700} sx={{ mt: -1 }}>
      Page not found
    </Typography>

    <Typography
      variant="body1"
      color="text.secondary"
      sx={{ maxWidth: 400, lineHeight: 1.7 }}
    >
      The page you&apos;re looking for doesn&apos;t exist or may have been
      moved.
    </Typography>

    <Button
      component={Link}
      to="/"
      variant="contained"
      size="large"
      sx={{ mt: 2, px: 4, borderRadius: 2 }}
    >
      Back to home
    </Button>
  </Box>
);
