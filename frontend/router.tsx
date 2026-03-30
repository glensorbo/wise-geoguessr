import { BrowserRouter, Route, Routes } from 'react-router';

import { AnalyticsProvider } from './features/analytics/analyticsProvider';
import { PageLayout } from './layout/pageLayout';
import { PublicLayout } from './layout/publicLayout';
import { HomePage } from './pages/homePage';
import { LoginPage } from './pages/loginPage';
import { NotFoundPage } from './pages/notFoundPage';
import { ProtectedRoute } from './shared/components/protectedRoute';

/**
 * Application router.
 *
 * Public routes use PublicLayout (TopNav only, no sidebar).
 * Protected routes sit inside ProtectedRoute → PageLayout.
 */
export const AppRouter = () => (
  <BrowserRouter>
    <AnalyticsProvider />
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Public — home dashboard accessible without auth */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Protected — authenticated users only */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PageLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
