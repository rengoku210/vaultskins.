import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import listingRoutes from './routes/listings.routes.js';
import adminRoutes from './routes/admin.routes.js';
import miscRoutes from './routes/misc.routes.js';
import { getDb } from './services/db.js';
import { initFirebase } from './services/firebase.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_, res) => {
  res.json({ ok: true, service: 'VaultSkins API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', miscRoutes);

app.use((err, _, res, __) => {
  console.error(err);
  return res.status(500).json({ error: 'Unexpected server error.' });
});

const start = async () => {
  await getDb();
  initFirebase();
  app.listen(env.port, () => {
    console.log(`VaultSkins backend listening at http://localhost:${env.port}`);
  });
};

start();
