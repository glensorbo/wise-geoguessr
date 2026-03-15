import { CssBaseline, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'bun:test';

import { createAppTheme } from '../theme';
import { HomePage } from './Home.page';

test('renders the dashboard shell and section loading states while results load', () => {
  const mockedFetch = () => {
    return new Promise<Response>(() => {});
  };

  const originalFetch = globalThis.fetch;
  window.localStorage.clear();
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

test('opens the login modal from the header', () => {
  const mockedFetch = () => {
    return new Promise<Response>(() => {});
  };

  const originalFetch = globalThis.fetch;
  window.localStorage.clear();
  globalThis.fetch = mockedFetch as unknown as typeof fetch;

  try {
    render(
      <ThemeProvider theme={createAppTheme('light')}>
        <CssBaseline />
        <HomePage />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByRole('dialog', { name: 'Log in' })).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('limits the points table to 10 rows per page', async () => {
  const selectedYear = new Date().getFullYear();
  const years = [selectedYear];
  const results = Array.from({ length: 12 }, (_, index) => ({
    date: `${selectedYear}-01-${String(index + 1).padStart(2, '0')}`,
    scores: {
      Glen: 10_000 + index,
      Thomas: 9_000 + index,
    },
  }));

  const originalFetch = globalThis.fetch;
  window.localStorage.clear();
  const mockedFetch = Object.assign(
    (async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.includes('/api/results/years')) {
        return new Response(JSON.stringify(years), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (url.includes(`/api/results?year=${selectedYear}`)) {
        return new Response(JSON.stringify(results), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Unexpected fetch request: ${url}`);
    }) as typeof fetch,
    {
      preconnect: (...args: Parameters<typeof fetch.preconnect>) => {
        originalFetch.preconnect?.(...args);
      },
    },
  );
  globalThis.fetch = mockedFetch;

  try {
    const { container } = render(
      <ThemeProvider theme={createAppTheme('light')}>
        <CssBaseline />
        <HomePage />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        container.querySelector('.MuiTablePagination-displayedRows')
          ?.textContent,
      ).toBe('1–10 of 12');
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
