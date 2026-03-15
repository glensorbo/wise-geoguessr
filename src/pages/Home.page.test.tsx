import { CssBaseline, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'bun:test';

import { createAppTheme } from '../theme';
import { HomePage } from './Home.page';

test('renders the dashboard shell and section loading states while results load', () => {
  const mockedFetch = () => {
    return new Promise<Response>(() => {});
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockedFetch as unknown as typeof fetch;

  try {
    render(
      <ThemeProvider theme={createAppTheme('light')}>
        <CssBaseline />
        <HomePage />
      </ThemeProvider>,
    );

    expect(screen.getByText('Wise GeoGuessr results')).toBeDefined();
    expect(screen.getAllByText('Loading results...').length).toBeGreaterThan(0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
