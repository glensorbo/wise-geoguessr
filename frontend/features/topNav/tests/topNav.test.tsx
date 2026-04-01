import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { TopNav } from '../components/topNav';
import { authSlice } from '@frontend/features/login/state/authSlice';
import { loginFormSlice } from '@frontend/features/login/state/loginFormSlice';
import { ThemeProvider } from '@frontend/providers/themeProvider';
import { baseApi } from '@frontend/redux/api/baseApi';
import { sidebarSlice } from '@frontend/redux/slices/sidebarSlice';
import { themeSlice } from '@frontend/redux/slices/themeSlice';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

const createTestStore = (token: string | null) =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [themeSlice.name]: themeSlice.reducer,
      [sidebarSlice.name]: sidebarSlice.reducer,
      [authSlice.name]: authSlice.reducer,
      [loginFormSlice.name]: loginFormSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        token,
        rememberedEmail: null,
      },
    },
  });

const findButtonByName = (name: string) =>
  [...document.querySelectorAll('button')].find(
    (element) => element.getAttribute('aria-label') === name,
  ) as HTMLButtonElement | undefined;

const findMenuItemByText = (text: string) =>
  [...document.querySelectorAll('[role="menuitem"]')].find((element) =>
    element.textContent?.includes(text),
  ) as HTMLElement | undefined;

const click = async (element: HTMLElement) => {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
  });
};

describe('TopNav', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(container);

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('shows the user menu publicly and highlights login for guests', async () => {
    const store = createTestStore(null);

    await act(async () => {
      root.render(
        <Provider store={store}>
          <ThemeProvider>
            <MemoryRouter>
              <TopNav
                drawerWidth={280}
                isDesktop
                isSidebarCollapsed={false}
                onMenuClick={() => {}}
              />
            </MemoryRouter>
          </ThemeProvider>
        </Provider>,
      );
    });

    expect(findButtonByName('Open user menu')).toBeDefined();
    expect(findMenuItemByText('Login')).toBeUndefined();

    const menuButton = findButtonByName('Open user menu');
    expect(menuButton).toBeDefined();

    await click(menuButton!);

    expect(document.body.textContent).toContain('Change theme');
    expect(document.body.textContent).toContain('Login');
    expect(document.body.textContent).not.toContain('Change password');
    expect(document.body.textContent).not.toContain('Logout');

    const loginItem = findMenuItemByText('Login');
    expect(loginItem).toBeDefined();
    expect(loginItem?.getAttribute('data-highlight-tone')).toBe('primary');
  });

  test('shows authenticated-only actions and highlights logout for signed-in users', async () => {
    const store = createTestStore('not-a-signup-token');

    await act(async () => {
      root.render(
        <Provider store={store}>
          <ThemeProvider>
            <MemoryRouter>
              <TopNav
                drawerWidth={280}
                isDesktop
                isSidebarCollapsed={false}
                onMenuClick={() => {}}
              />
            </MemoryRouter>
          </ThemeProvider>
        </Provider>,
      );
    });

    expect(document.body.textContent).toContain('+ Add results');

    const menuButton = findButtonByName('Open user menu');
    expect(menuButton).toBeDefined();

    await click(menuButton!);

    expect(document.body.textContent).toContain('Change password');
    expect(document.body.textContent).toContain('Logout');
    expect(document.body.textContent).not.toContain('Login');

    const logoutItem = findMenuItemByText('Logout');
    expect(logoutItem).toBeDefined();
    expect(logoutItem?.getAttribute('data-highlight-tone')).toBe('danger');
  });
});
