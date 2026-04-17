import { Router } from 'express';
import { getDb } from '../services/db.js';
import { requireAuth, requireAdmin, requireTermsAccepted } from '../middleware/auth.js';
import { validateListingPayload } from '../middleware/validate.js';
import { decryptText, encryptText } from '../utils/crypto.js';

const router = Router();

router.get('/', async (req, res) => {
  const db = await getDb();
  const listings = await db.all(
    `SELECT l.id, l.title, l.description, l.rank, l.skins_json, l.contact_email, l.contact_social,
      l.rent_hour, l.rent_day, l.buy_price, l.listing_type, l.preview_image,
      u.email AS seller_email, u.phone_verified AS seller_verified
    FROM listings l
    JOIN users u ON u.id = l.user_id
    WHERE l.status = 'approved' AND l.active = 1
    ORDER BY l.created_at DESC`
  );

  return res.json(
    listings.map((row) => {
      const skins = JSON.parse(row.skins_json || '[]');
      return {
        ...row,
        skins,
        thumbnail: row.preview_image || skins[0]?.displayIcon || '/placeholder-thumb.png'
      };
    })
  );
});

router.post('/', requireAuth, requireTermsAccepted, validateListingPayload, async (req, res) => {
  const db = await getDb();
  const {
    title,
    description,
    rank,
    skins = [],
    riotId,
    riotPassword,
    contactEmail,
    contactSocial,
    rentHour,
    rentDay,
    buyPrice,
    listingType,
    previewImage
  } = req.body;

  const result = await db.run(
    `INSERT INTO listings (
      user_id, title, description, rank, skins_json, riot_id, riot_password, contact_email,
      contact_social, rent_hour, rent_day, buy_price, listing_type, status, preview_image, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    req.user.id,
    title,
    description,
    rank || null,
    JSON.stringify(skins),
    encryptText(riotId),
    encryptText(riotPassword),
    contactEmail,
    contactSocial || null,
    rentHour,
    rentDay,
    buyPrice,
    listingType,
    previewImage || null,
    Date.now()
  );

  return res.status(201).json({ id: result.lastID, message: 'Listing submitted for admin approval.' });
});

router.get('/mine', requireAuth, requireTermsAccepted, async (req, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC', req.user.id);
  return res.json(rows);
});

router.get('/pending', requireAuth, requireAdmin, async (req, res) => {
  const db = await getDb();
  const rows = await db.all(
    `SELECT l.*, u.email AS seller_email
     FROM listings l
     JOIN users u ON u.id = l.user_id
     WHERE l.status = 'pending'
     ORDER BY l.created_at ASC`
  );
  return res.json(rows);
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const db = await getDb();
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  }

  const listing = await db.get('SELECT user_id FROM listings WHERE id = ?', req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found.' });

  await db.run('UPDATE listings SET status = ? WHERE id = ?', status, req.params.id);
  await db.run(
    'INSERT INTO notifications (user_id, message, created_at) VALUES (?, ?, ?)',
    listing.user_id,
    `Your listing #${req.params.id} was ${status}.`,
    Date.now()
  );

  return res.json({ message: `Listing ${status}.` });
});

router.post('/:id/purchase', requireAuth, requireTermsAccepted, async (req, res) => {
  const db = await getDb();
  const { mode = 'buy' } = req.body;
  const listing = await db.get(
    'SELECT * FROM listings WHERE id = ? AND status = "approved" AND active = 1',
    req.params.id
  );
  if (!listing) return res.status(404).json({ error: 'Listing unavailable.' });

  if (mode === 'buy' && !['sell', 'both'].includes(listing.listing_type)) {
    return res.status(400).json({ error: 'Buy option is not available for this listing.' });
  }
  if ((mode === 'rent_day' || mode === 'rent_hour') && !['rent', 'both'].includes(listing.listing_type)) {
    return res.status(400).json({ error: 'Rent option is not available for this listing.' });
  }

  const amount =
    mode === 'rent_day'
      ? listing.rent_day
      : mode === 'rent_hour'
        ? listing.rent_hour
        : listing.buy_price;
  if (!amount || amount < 0) return res.status(400).json({ error: 'Invalid payment mode for this listing.' });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const isRental = mode === 'rent_hour' || mode === 'rent_day';
  const durationMs =
    mode === 'rent_hour' ? 60 * 60 * 1000 : mode === 'rent_day' ? 24 * 60 * 60 * 1000 : null;
  const expiresAt = isRental ? Date.now() + durationMs : null;

  const transaction = await db.run(
    `INSERT INTO transactions (listing_id, buyer_id, type, amount, access_expires_at, mock_txn_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    listing.id,
    req.user.id,
    mode,
    amount,
    expiresAt,
    `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    Date.now()
  );

  const credentials = {
    riotId: decryptText(listing.riot_id),
    riotPassword: decryptText(listing.riot_password)
  };

  return res.json({
    message: 'Payment simulated successfully.',
    transactionId: transaction.lastID,
    access: {
      expiresAt,
      credentials
    }
  });
});

router.get('/access/history', requireAuth, requireTermsAccepted, async (req, res) => {
  const db = await getDb();
  const rows = await db.all(
    `SELECT t.*, l.title
     FROM transactions t
     JOIN listings l ON l.id = t.listing_id
     WHERE t.buyer_id = ?
     ORDER BY t.created_at DESC`,
    req.user.id
  );

  const now = Date.now();
  return res.json(
    rows.map((row) => ({
      ...row,
      hasAccess: !row.access_expires_at || row.access_expires_at > now
    }))
  );
});

export default router;
