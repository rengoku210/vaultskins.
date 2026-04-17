import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../services/db.js';
import { env } from '../config/env.js';
import { sendOtpEmail, sendWelcomeEmail } from '../services/mailer.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyFirebaseIdToken } from '../services/firebase.js';

const router = Router();
const otp = () => String(Math.floor(100000 + Math.random() * 900000));

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: '7d'
  });

router.post('/signup', async (req, res) => {
  const db = await getDb();
  const { email, password } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Provide valid email and a password with 8+ chars.' });
  }

  const existing = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const code = otp();
  const passwordHash = await bcrypt.hash(password, 10);
  const role = email.toLowerCase() === env.adminEmail.toLowerCase() ? 'admin' : 'user';

  await db.run(
    `INSERT INTO users (email, password_hash, role, otp_code, otp_expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    email.toLowerCase(),
    passwordHash,
    role,
    code,
    Date.now() + 10 * 60 * 1000,
    Date.now()
  );

  await sendOtpEmail(email, code);
  return res.json({ message: 'OTP sent to email.' });
});

router.post('/verify-email-otp', async (req, res) => {
  const db = await getDb();
  const { email, code } = req.body;

  const user = await db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase());
  if (!user || user.otp_code !== code || Date.now() > user.otp_expires_at) {
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }

  await db.run(
    'UPDATE users SET email_verified = 1, otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
    user.id
  );

  await sendWelcomeEmail(user.email);
  return res.json({ message: 'Email verified. You can now sign in.' });
});

router.post('/login', async (req, res) => {
  const db = await getDb();
  const { email, password } = req.body;

  const user = await db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
  if (!user.email_verified) {
    return res.status(403).json({ error: 'Email verification required before login.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash || '');
  if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

  return res.json({
    token: signToken(user),
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      termsAccepted: Boolean(user.terms_accepted),
      phoneVerified: Boolean(user.phone_verified)
    }
  });
});

router.post('/google', async (req, res) => {
  const db = await getDb();
  const { firebaseIdToken } = req.body;

  try {
    const decoded = await verifyFirebaseIdToken(firebaseIdToken);
    const email = String(decoded.email || '').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Google account missing email.' });

    let user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user) {
      const role = email === env.adminEmail.toLowerCase() ? 'admin' : 'user';
      const result = await db.run(
        `INSERT INTO users (email, role, terms_accepted, email_verified, created_at)
         VALUES (?, ?, 0, 1, ?)`,
        email,
        role,
        Date.now()
      );
      user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
    }

    return res.json({ token: signToken(user), user });
  } catch {
    return res.status(400).json({ error: 'Google sign-in failed.' });
  }
});

router.post('/accept-terms', requireAuth, async (req, res) => {
  const db = await getDb();
  await db.run('UPDATE users SET terms_accepted = 1 WHERE id = ?', req.user.id);
  return res.json({ message: 'Terms accepted.' });
});

router.post('/verify-phone', requireAuth, async (req, res) => {
  const db = await getDb();
  const { e164Phone } = req.body;
  if (!/^\+\d{8,15}$/.test(String(e164Phone || ''))) {
    return res.status(400).json({ error: 'Phone must be in E.164 format.' });
  }

  await db.run('UPDATE users SET phone_verified = 1 WHERE id = ?', req.user.id);
  await db.run(
    'INSERT INTO notifications (user_id, message, created_at) VALUES (?, ?, ?)',
    req.user.id,
    'Phone verification successful. Trust badge enabled.',
    Date.now()
  );
  return res.json({ message: 'Phone verified.' });
});

router.get('/me', requireAuth, async (req, res) => {
  const db = await getDb();
  const user = await db.get(
    'SELECT id, email, role, terms_accepted, phone_verified, email_verified, created_at FROM users WHERE id = ?',
    req.user.id
  );
  return res.json(user);
});

export default router;
