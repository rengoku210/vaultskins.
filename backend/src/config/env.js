import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const readEncryptionKey = () => {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) return null;
  return raw;
};

const encryptionKey = readEncryptionKey();

if (nodeEnv === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a 32+ character secret in production.');
  }

  if (!encryptionKey || Buffer.from(encryptionKey, 'utf8').length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes in production.');
  }
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-me',
  encryptionKey: encryptionKey || '0123456789abcdef0123456789abcdef',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@vaultskins.app',
  smtpHost: process.env.SMTP_HOST || 'smtp.ethereal.email',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || ''
};
