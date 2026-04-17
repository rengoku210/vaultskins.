import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useNotify } from '../context/NotificationContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MarketplacePage() {
  const [listings, setListings] = useState(null);
  const { notify } = useNotify();
  const { user } = useAuth();

  useEffect(() => {
    apiFetch('/listings')
      .then(setListings)
      .catch((error) => notify(error.message, 'error'));
  }, [notify]);

  const purchase = async (listingId, mode) => {
    if (!user) {
      notify('Please login to purchase accounts.', 'error');
      return;
    }

    try {
      const result = await apiFetch(`/listings/${listingId}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ mode })
      });
      notify(`Access granted. Transaction #${result.transactionId}`, 'success');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  if (!listings) return <div className="skeleton">Loading premium inventory…</div>;

  return (
    <section>
      <h1>Approved Premium Valorant Accounts</h1>
      <div className="listing-grid">
        {listings.map((listing) => (
          <article key={listing.id} className="card">
            {listing.skins?.[0]?.video ? (
              <video src={listing.skins[0].video} poster={listing.thumbnail} autoPlay loop muted playsInline />
            ) : (
              <img src={listing.thumbnail} alt={listing.title} />
            )}
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <small>Rank: {listing.rank || 'Unknown'} · Seller: {listing.seller_email}</small>
            <div className="price-row">
              {listing.rent_hour && <button onClick={() => purchase(listing.id, 'rent_hour')}>Rent / hour ${listing.rent_hour}</button>}
              {listing.rent_day && <button onClick={() => purchase(listing.id, 'rent_day')}>Rent / day ${listing.rent_day}</button>}
              {listing.buy_price && <button onClick={() => purchase(listing.id, 'buy')}>Buy ${listing.buy_price}</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
