import { BrowserRouter, Route, Routes } from 'react-router';

import { AnalyticsProvider } from './features/analytics/analyticsProvider';
import { PageLayout } from './layout/pageLayout';
import { HallOfFamePage } from './pages/hallOfFamePage';
import { HomePage } from './pages/homePage';
import { LoginPage } from './pages/loginPage';
import { NotFoundPage } from './pages/notFoundPage';
import { ResultsPage } from './pages/resultsPage';
import { StatsPage } from './pages/statsPage';
import { ProtectedRoute } from './shared/components/protectedRoute';

/**
 * Application router.
 *
 * Public routes use PageLayout (TopNav + LeftNav, no auth required).
 * Protected routes sit inside ProtectedRoute → PageLayout.
 */
export const AppRouter = () => (
  <BrowserRouter>
    <AnalyticsProvider />
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Public — accessible without auth, full layout with sidebar */}
      <Route element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="hall-of-fame" element={<HallOfFamePage />} />
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
