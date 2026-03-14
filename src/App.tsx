import { MantineProvider } from '@mantine/core';

import { Router } from './Router';
import { theme } from './theme';

import '@mantine/core/styles.css';

export const App = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Router />
    </MantineProvider>
  );
};
