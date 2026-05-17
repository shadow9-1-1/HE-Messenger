import admin from 'firebase-admin';

export function initFirebaseAdmin(): void {
  if (admin.apps.length > 0) return; // already initialized

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  console.log('✅ Firebase Admin initialized');
}

export { admin };
