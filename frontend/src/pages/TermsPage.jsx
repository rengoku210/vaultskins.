import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TermsPage() {
  const navigate = useNavigate();
  const { setUser, user } = useAuth();

  const accept = async () => {
    await apiFetch('/auth/accept-terms', { method: 'POST' });
    setUser({ ...user, termsAccepted: true });
    navigate('/dashboard');
  };

  return (
    <section className="form-card">
      <h1>Marketplace Terms</h1>
      <p>VaultSkins is not responsible for scams. Verification status is not a guarantee. Users accept all transaction risk.</p>
      <button onClick={accept}>Accept & Continue</button>
      <button onClick={() => navigate('/goodbye')}>Reject Terms</button>
    </section>
  );
}
