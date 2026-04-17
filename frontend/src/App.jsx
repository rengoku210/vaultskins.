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

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="skeleton">Booting secure services…</div>;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MarketplacePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/terms" element={user ? <TermsPage /> : <Navigate to="/login" />} />
        <Route path="/goodbye" element={<GoodbyePage />} />
      </Routes>
    </Layout>
  );
}
