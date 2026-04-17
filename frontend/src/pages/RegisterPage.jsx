import { useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useNotify } from '../context/NotificationContext.jsx';

export default function RegisterPage() {
  const { notify } = useNotify();
  const [form, setForm] = useState({ email: '', password: '', otp: '' });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const signup = async () => {
    try {
      await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(form) });
      notify('OTP sent. Check your email inbox.', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const verify = async () => {
    try {
      await apiFetch('/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, code: form.otp })
      });
      notify('Email verified! You can login now.', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  return (
    <section className="form-card">
      <h1>Create account</h1>
      <input placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} />
      <input placeholder="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} />
      <button onClick={signup}>Send OTP</button>
      <input placeholder="Email OTP" value={form.otp} onChange={(e) => update('otp', e.target.value)} />
      <button onClick={verify}>Verify & Activate</button>
      <p>Optional phone verification can be completed in profile using Firebase OTP + reCAPTCHA.</p>
    </section>
  );
}
