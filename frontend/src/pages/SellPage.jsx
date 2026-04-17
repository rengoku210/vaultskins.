import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useNotify } from '../context/NotificationContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SkinSelector from '../components/SkinSelector.jsx';

const defaultForm = {
  title: '', description: '', rank: '', riotId: '', riotPassword: '', contactEmail: '', contactSocial: '',
  rentHour: '', rentDay: '', buyPrice: '', listingType: 'both', previewImage: ''
};

export default function SellPage() {
  const { user } = useAuth();
  const { notify } = useNotify();
  const [form, setForm] = useState(defaultForm);
  const [skins, setSkins] = useState([]);
  const [selectedSkins, setSelectedSkins] = useState([]);

  useEffect(() => {
    apiFetch('/skins').then(setSkins).catch(() => notify('Skin catalog unavailable.', 'error'));
  }, [notify]);

  if (!user) return <p>Please login to list an account.</p>;

  const submit = async (event) => {
    event.preventDefault();
    try {
      await apiFetch('/listings', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          rentHour: form.rentHour ? Number(form.rentHour) : null,
          rentDay: form.rentDay ? Number(form.rentDay) : null,
          buyPrice: form.buyPrice ? Number(form.buyPrice) : null,
          skins: selectedSkins
        })
      });
      notify('Listing submitted for admin approval.', 'success');
      setForm(defaultForm);
      setSelectedSkins([]);
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  return (
    <form className="form-card" onSubmit={submit}>
      <h1>Create Listing</h1>
      {Object.keys(defaultForm).map((key) => (
        key === 'listingType'
          ? <select key={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
              <option value="rent">Rent Only</option>
              <option value="sell">Sell Only</option>
              <option value="both">Both</option>
            </select>
          : <input key={key} value={form[key]} placeholder={key} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      ))}
      <SkinSelector skins={skins} selected={selectedSkins} onChange={setSelectedSkins} />
      <button type="submit">Submit Listing</button>
    </form>
  );
}
