import { BrowserRouter, Route, Routes } from 'react-router';

import { AnalyticsProvider } from './features/analytics/analyticsProvider';
import { PageLayout } from './layout/pageLayout';
import { HallOfFamePage } from './pages/hallOfFamePage';
import { HeadToHeadPage } from './pages/headToHeadPage';
import { HomePage } from './pages/homePage';
import { LoginPage } from './pages/loginPage';
import { NotFoundPage } from './pages/notFoundPage';
import { PlayerProfilePage } from './pages/playerProfilePage';
import { RecapPage } from './pages/recapPage';
import { ResultsPage } from './pages/resultsPage';
import { RoundDetailPage } from './pages/roundDetailPage';
import { SetPasswordPage } from './pages/setPasswordPage';
import { StatsPage } from './pages/statsPage';

/**
 * Application router.
 *
 * Public routes use PageLayout (TopNav + LeftNav, no auth required).
 * Add protected routes inside a ProtectedRoute wrapper when needed.
 */
export const AppRouter = () => (
  <BrowserRouter>
    <AnalyticsProvider />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />

      {/* Public — accessible without auth, full layout with sidebar */}
      <Route element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="results/:roundId" element={<RoundDetailPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="hall-of-fame" element={<HallOfFamePage />} />
        <Route path="head-to-head" element={<HeadToHeadPage />} />
        <Route path="players/:name" element={<PlayerProfilePage />} />
        <Route path="recap/:year" element={<RecapPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
