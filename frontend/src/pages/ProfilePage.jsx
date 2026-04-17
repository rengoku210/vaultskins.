import { useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotify } from '../context/NotificationContext.jsx';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { notify } = useNotify();
  const [phone, setPhone] = useState('+91');

  if (!user) return <p>Login required.</p>;

  const verifyPhone = async () => {
    try {
      await apiFetch('/auth/verify-phone', { method: 'POST', body: JSON.stringify({ e164Phone: phone }) });
      setUser({ ...user, phoneVerified: true });
      notify('Phone verified. Badge added to profile.', 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  return (
    <section className="form-card">
      <h1>Profile</h1>
      <p>Avatar: 🎯</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Status: {user.phoneVerified ? 'Phone Verified ✅' : 'Unverified'}</p>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button onClick={verifyPhone}>Verify Phone (Firebase OTP)</button>
    </section>
  );
}
