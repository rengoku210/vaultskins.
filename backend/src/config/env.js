import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  encryptionKey:
    process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@vaultskins.app',
  smtpHost: process.env.SMTP_HOST || 'smtp.ethereal.email',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || ''
};
