import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotify } from '../context/NotificationContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useNotify();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      login(payload);
      if (!payload.user.termsAccepted) navigate('/terms');
      else navigate('/dashboard');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  return (
    <form onSubmit={submit} className="form-card">
      <h1>Login</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Sign In</button>
      <button type="button" onClick={() => notify('Integrate Firebase Google Sign-In here.', 'info')}>
        Continue with Google
      </button>
    </form>
  );
}
