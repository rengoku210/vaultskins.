import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('vaultskins_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await apiFetch('/auth/me');
        setUser({
          id: me.id,
          email: me.email,
          role: me.role,
          termsAccepted: Boolean(me.terms_accepted),
          phoneVerified: Boolean(me.phone_verified)
        });
      } catch {
        localStorage.removeItem('vaultskins_token');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = ({ token, user: payload }) => {
    localStorage.setItem('vaultskins_token', token);
    setUser(payload);
  };

  const logout = () => {
    localStorage.removeItem('vaultskins_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'admin', login, logout, setUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
