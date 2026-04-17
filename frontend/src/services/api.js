const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const withTimeout = (promise, ms = 15000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return Promise.race([
    promise(controller.signal).finally(() => clearTimeout(timeout)),
    new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => reject(new Error('Server timeout. Try again.')));
    })
  ]);
};

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('vaultskins_token');
  const response = await withTimeout((signal) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`);
  }

  return body;
};
