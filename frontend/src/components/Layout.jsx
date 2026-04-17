import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';

const NavItem = ({ to, children }) => (
  <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    {children}
  </NavLink>
);

export default function Layout({ children }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const unread = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (!user) return;
    apiFetch('/notifications')
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => setNotifications([]));
  }, [user]);

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="logo">VaultSkins</Link>
        <nav className="nav">
          <NavItem to="/">Marketplace</NavItem>
          <NavItem to="/sell">Sell</NavItem>
          <NavItem to="/dashboard">Dashboard</NavItem>
          {isAdmin && <NavItem to="/admin">Admin</NavItem>}
        </nav>
        <div className="actions">
          {user ? (
            <>
              <details className="bell">
                <summary>🔔 {unread > 0 ? `(${unread})` : ''}</summary>
                <div className="panel">
                  {notifications.length === 0
                    ? <p>No notifications yet.</p>
                    : notifications.slice(0, 8).map((item) => <p key={item.id}>{item.message}</p>)}
                </div>
              </details>
              <details className="profile-menu">
                <summary>{user.email}</summary>
                <div className="panel">
                  <button onClick={() => navigate('/profile')}>Profile</button>
                  <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
                </div>
              </details>
            </>
          ) : (
            <button onClick={() => navigate('/login')}>Login</button>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
