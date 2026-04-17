import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getDb } from '../services/db.js';

export const requireAuth = (req, res, next) => {
  const bearer = req.headers.authorization || '';
  const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid session token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required.' });
  }
  return next();
};

export const requireTermsAccepted = async (req, res, next) => {
  const db = await getDb();
  const user = await db.get('SELECT terms_accepted FROM users WHERE id = ?', req.user.id);

  if (!user) {
    return res.status(401).json({ error: 'Session user no longer exists.' });
  }

  if (!user.terms_accepted) {
    return res.status(403).json({ error: 'Accept terms before using this feature.' });
  }

  return next();
};
