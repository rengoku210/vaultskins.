const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('vaultskins_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Request failed');
  }

  return body;
};
