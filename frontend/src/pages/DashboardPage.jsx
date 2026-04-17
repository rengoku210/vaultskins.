import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    apiFetch('/dashboard').then(setStats).catch(() => setStats({ error: true }));
  }, [user]);

  if (!user) return <p>Login required for dashboard access.</p>;
  if (!stats) return <div className="skeleton">Loading dashboard…</div>;
  if (stats.error) return <p>Server offline or unavailable right now.</p>;

  return (
    <section>
      <h1>My Dashboard</h1>
      <div className="metrics">
        <article><h3>Active Rentals</h3><p>{stats.activeRentals}</p></article>
        <article><h3>Total Earnings</h3><p>${stats.totalEarnings.toFixed(2)}</p></article>
        <article><h3>Access History</h3><p>{stats.accessHistory.length}</p></article>
      </div>
    </section>
  );
}
