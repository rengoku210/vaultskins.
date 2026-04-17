import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);

  const load = async () => {
    const [statsResult, pendingResult] = await Promise.all([
      apiFetch('/admin/stats'),
      apiFetch('/listings/pending')
    ]);
    setStats(statsResult);
    setPending(pendingResult);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load().catch(() => setStats({ error: true }));
  }, [isAdmin]);

  const decide = async (id, status) => {
    await apiFetch(`/listings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await load();
  };

  if (!isAdmin) return <p>Admin access only.</p>;
  if (!stats) return <div className="skeleton">Loading admin panel…</div>;

  return (
    <section>
      <h1>Admin Panel</h1>
      <p>Users: {stats.users} · Listings: {stats.listings} · Transactions: {stats.transactions}</p>
      <h2>Pending approvals</h2>
      {pending.map((item) => (
        <article className="card" key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <button onClick={() => decide(item.id, 'approved')}>Approve</button>
          <button onClick={() => decide(item.id, 'rejected')}>Reject</button>
        </article>
      ))}
    </section>
  );
}
