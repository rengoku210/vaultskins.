# VaultSkins

VaultSkins is a full-stack premium marketplace prototype for renting and selling Valorant accounts.

## Project layout

- `backend/` Express + SQLite + JWT + AES-256 credential encryption.
- `frontend/` React (Vite) dark-themed UI with auth and toast contexts.

## Key implemented features

- Email/password signup and login with OTP verification workflow.
- Optional Google login route (via Firebase Admin token verification).
- Terms acceptance gate with redirect to a goodbye page on rejection.
- User and admin role model (admin auto-assigned by configured email).
- Listing workflow (pending → approved/rejected) with admin moderation.
- Marketplace showing only active approved listings.
- Skin fetch and flattening from Valorant `/v1/weapons` endpoint.
- Dummy payment simulation with rental expiry support.
- Credentials encrypted in DB and decrypted only when purchase succeeds.
- Notification API and frontend dropdown/toast UX (no browser alerts).
- Dashboard and admin stats panel.

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Create `backend/.env` with:

```bash
PORT=4000
JWT_SECRET=replace-with-strong-secret
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
ADMIN_EMAIL=admin@vaultskins.app
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FIREBASE_SERVICE_ACCOUNT_JSON=
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Optional frontend env:

```bash
VITE_API_BASE=http://localhost:4000/api
```

## Notes

- Phone verification UI is wired for E.164 input and backend trust-badge update; hook Firebase Phone Auth + reCAPTCHA in production.
- Dummy payments intentionally do not process real cards.
- Marketplace legal language included in Terms page per requested risk acceptance.
