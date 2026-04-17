import { Router } from 'express';
import { getDb } from '../services/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/stats', async (_, res) => {
  const db = await getDb();
  const [users, listings, transactions, pending] = await Promise.all([
    db.get('SELECT COUNT(*) as count FROM users'),
    db.get('SELECT COUNT(*) as count FROM listings'),
    db.get('SELECT COUNT(*) as count FROM transactions'),
    db.get("SELECT COUNT(*) as count FROM listings WHERE status = 'pending'")
  ]);

  return res.json({
    users: users.count,
    listings: listings.count,
    transactions: transactions.count,
    pendingListings: pending.count
  });
});

router.get('/users', async (_, res) => {
  const db = await getDb();
  const users = await db.all(
    `SELECT id, email, role, terms_accepted, email_verified, phone_verified, created_at
     FROM users ORDER BY created_at DESC`
  );
  return res.json(users);
});

router.patch('/users/:id/verify', async (req, res) => {
  const db = await getDb();
  await db.run('UPDATE users SET phone_verified = 1 WHERE id = ?', req.params.id);
  return res.json({ message: 'User marked as verified.' });
});

export default router;
