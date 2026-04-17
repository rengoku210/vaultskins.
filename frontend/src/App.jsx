import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SellPage from './pages/SellPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import GoodbyePage from './pages/GoodbyePage.jsx';
import { useAuth } from './context/AuthContext.jsx';

const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RequireTerms = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.termsAccepted) return <Navigate to="/terms" replace />;
  return children;
};

const RequireAdmin = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="skeleton">Booting secure services…</div>;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MarketplacePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        <Route path="/sell" element={<RequireTerms><SellPage /></RequireTerms>} />
        <Route path="/dashboard" element={<RequireTerms><DashboardPage /></RequireTerms>} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/terms" element={user ? <TermsPage /> : <Navigate to="/login" replace />} />
        <Route path="/goodbye" element={<GoodbyePage />} />
      </Routes>
    </Layout>
  );
}
