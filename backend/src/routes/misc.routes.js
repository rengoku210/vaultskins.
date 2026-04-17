import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDb } from '../services/db.js';
import { fetchWeaponSkins } from '../services/valorant.js';

const router = Router();

router.get('/skins', async (_, res) => {
  try {
    const skins = await fetchWeaponSkins();
    return res.json(skins);
  } catch {
    return res.status(503).json({ error: 'Unable to fetch skins currently.' });
  }
});

router.get('/notifications', requireAuth, async (req, res) => {
  const db = await getDb();
  const notifications = await db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
    req.user.id
  );
  const unread = notifications.filter((item) => !item.read).length;
  return res.json({ unread, notifications });
});

router.post('/notifications/read-all', requireAuth, async (req, res) => {
  const db = await getDb();
  await db.run('UPDATE notifications SET read = 1 WHERE user_id = ?', req.user.id);
  return res.json({ message: 'All notifications marked as read.' });
});

router.get('/dashboard', requireAuth, async (req, res) => {
  const db = await getDb();
  const [activeRentals, totalEarnings, history] = await Promise.all([
    db.get(
      `SELECT COUNT(*) as count FROM transactions
       WHERE buyer_id = ? AND access_expires_at IS NOT NULL AND access_expires_at > ?`,
      req.user.id,
      Date.now()
    ),
    db.get(
      `SELECT COALESCE(SUM(t.amount),0) as value
       FROM transactions t
       JOIN listings l ON l.id = t.listing_id
       WHERE l.user_id = ?`,
      req.user.id
    ),
    db.all(
      `SELECT t.id, t.type, t.amount, t.created_at, l.title
       FROM transactions t
       JOIN listings l ON l.id = t.listing_id
       WHERE t.buyer_id = ? OR l.user_id = ?
       ORDER BY t.created_at DESC LIMIT 20`,
      req.user.id,
      req.user.id
    )
  ]);

  return res.json({
    activeRentals: activeRentals.count,
    totalEarnings: Number(totalEarnings.value || 0),
    accessHistory: history
  });
});

export default router;
