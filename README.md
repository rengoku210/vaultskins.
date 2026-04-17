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

## Backend setup (Windows PowerShell)

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Create `backend/.env` with:

```bash
PORT=4000
JWT_SECRET=replace-with-strong-secret-of-at-least-32-chars
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
ADMIN_EMAIL=admin@vaultskins.app
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FIREBASE_SERVICE_ACCOUNT_JSON=
```

## Frontend setup (Windows PowerShell)

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

## Local run checklist

- `backend/data/` is auto-created on startup (prevents SQLite open failures on new machines).
- Start backend first so frontend API calls don't fail.
- If you get 403 from sell/buy/dashboard, accept terms first.
- For Google/Firebase and SMTP flows, supply valid credentials.

## Conflict-resolution note

If your PR shows merge conflicts with `main`, pull `main`, keep these files from this branch, then re-run checks:

- `README.md`
- `backend/src/config/env.js`
- `backend/src/middleware/auth.js`
- `backend/src/middleware/validate.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/listings.routes.js`
- `backend/src/routes/misc.routes.js`
- `backend/src/services/db.js`
- `frontend/src/App.jsx`
- `frontend/src/services/api.js`

## Notes

- Phone verification UI is wired for E.164 input and backend trust-badge update; hook Firebase Phone Auth + reCAPTCHA in production.
- Dummy payments intentionally do not process real cards.
- Marketplace legal language included in Terms page per requested risk acceptance.
