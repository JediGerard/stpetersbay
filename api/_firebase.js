// Shared Firebase Admin initialization for Vercel API routes
const admin = require('firebase-admin');

let db = null;

function getFirestore() {
  if (db) return db;

  if (!admin.apps.length) {
    // Check if running on Vercel (environment variable)
    if (process.env.FIREBASE_ADMIN_KEY) {
      try {
        // First attempt: Try parsing as-is (for properly formatted JSON)
        let serviceAccount;
        let keyToTry = process.env.FIREBASE_ADMIN_KEY;

        // Check if the key starts with a curly brace (JSON) or might be base64
        if (!keyToTry.startsWith('{')) {
          // Might be base64 encoded (common in Vercel)
          try {
            console.log('Attempting to decode from base64...');
            keyToTry = Buffer.from(keyToTry, 'base64').toString('utf-8');
          } catch (b64Error) {
            console.log('Not base64 encoded, proceeding with original value');
          }
        }

        try {
          serviceAccount = JSON.parse(keyToTry);
        } catch (e) {
          // Second attempt: If parsing fails, it might have unescaped newlines
          // This can happen when copying keys directly into Vercel UI
          console.log('Initial parse failed:', e.message);
          console.log('Attempting to fix newlines in the JSON string...');

          // More robust fix: only fix newlines within the private_key field
          const fixedKey = keyToTry
            .replace(/\\n/g, '%%NEWLINE%%')  // Temporarily preserve already escaped newlines
            .replace(/\n/g, '\\n')           // Escape actual newlines
            .replace(/\r/g, '\\r')           // Escape carriage returns
            .replace(/\t/g, '\\t')           // Escape tabs
            .replace(/%%NEWLINE%%/g, '\\n'); // Restore originally escaped newlines

          serviceAccount = JSON.parse(fixedKey);
          console.log('Successfully parsed after fixing newlines');
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: 'st-peters-bay-food-ordering'
        });
        console.log('Firebase Admin SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error.message);
        console.error('Key preview:', process.env.FIREBASE_ADMIN_KEY?.substring(0, 100));
        throw new Error('Invalid Firebase Admin Key format in environment variable');
      }
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
