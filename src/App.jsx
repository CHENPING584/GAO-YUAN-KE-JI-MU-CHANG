import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AdminReviewPage from './pages/AdminReviewPage';
import ApplyFarmerPage from './pages/ApplyFarmerPage';
import AuditStatusPage from './pages/AuditStatusPage';
import FarmerRouteGuard from './components/auth/FarmerRouteGuard';
import MainLayout from './components/layout/MainLayout';
import ConnectPage from './pages/ConnectPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import HomePage from './pages/HomePage';
import PartnersPage from './pages/PartnersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShowcasePage from './pages/ShowcasePage';
import TraceabilityPage from './pages/TraceabilityPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/traceability" element={<TraceabilityPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/showcase/:productId" element={<ProductDetailPage />} />
          <Route path="/apply-farmer" element={<ApplyFarmerPage />} />
          <Route path="/audit-status" element={<AuditStatusPage />} />
          <Route
            path="/dashboard/farmer"
            element={
              <FarmerRouteGuard>
                <FarmerDashboardPage />
              </FarmerRouteGuard>
            }
          />
          <Route path="/farmer-dashboard" element={<Navigate replace to="/dashboard/farmer" />} />
          <Route path="/admin-review" element={<AdminReviewPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/connect" element={<ConnectPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
