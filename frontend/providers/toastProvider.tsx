import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import type { RootState } from '@frontend/redux/store';
import type { ReactNode } from 'react';

import 'react-toastify/dist/ReactToastify.css';

interface Props {
  children: ReactNode;
}

/**
 * Renders the react-toastify container with the *opposite* theme to the current
 * colour mode, so toasts always have a contrasting background.
 * Dark mode → light toasts, light mode → dark toasts.
 * System mode resolves the OS preference before inverting.
 */
export const ToastProvider = ({ children }: Props) => {
  const mode = useSelector((state: RootState) => state.theme.mode);

  const [systemIsDark, setSystemIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effectiveIsDark =
    mode === 'dark' || (mode === 'system' && systemIsDark);
  const toastTheme = effectiveIsDark ? 'light' : 'dark';

  return (
    <>
      {children}
      <ToastContainer position="top-right" theme={toastTheme} />
    </>
  );
};
