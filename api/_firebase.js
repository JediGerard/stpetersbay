// Shared Firebase Admin initialization for Vercel API routes
const admin = require('firebase-admin');

let db = null;

function getFirestore() {
  if (db) return db;

  if (!admin.apps.length) {
    // Check if running on Vercel (environment variable)
    if (process.env.FIREBASE_ADMIN_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'st-peters-bay-food-ordering'
      });
    } else {
      // Local development - use file
      const serviceAccount = require('../firebase-admin-key.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'st-peters-bay-food-ordering'
      });
    }
  }

  db = admin.firestore();
  return db;
}

module.exports = { getFirestore, admin };
