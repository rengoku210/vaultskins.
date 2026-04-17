import admin from 'firebase-admin';

let initialized = false;

export const initFirebase = () => {
  if (initialized || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  initialized = true;
};

export const verifyFirebaseIdToken = async (idToken) => {
  if (!initialized) {
    throw new Error('Firebase auth is not configured.');
  }

  return admin.auth().verifyIdToken(idToken);
};
