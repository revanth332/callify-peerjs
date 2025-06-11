// src/firebaseAdmin.mjs (or .js if package.json has "type": "module")
import admin from 'firebase-admin';
import { Buffer } from 'buffer'; 
import 'dotenv/config'; // Ensure dotenv is loaded

// Ensure dotenv is configured if running locally
// In Vercel, process.env variables are available directly.
// In local dev, if using .env file, ensure it's loaded before this file
// (e.g., via `node -r dotenv/config your-app.mjs`) or in your main script.

// Check if Firebase app is already initialized
if (admin.apps.length === 0) {
  try {
    const encodedCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!encodedCredentials) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set.');
    }

    // Decode the Base64 string
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf8');

    // Parse the JSON string into an object
    const serviceAccount = JSON.parse(decodedCredentials);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully from Base64 credentials.');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // You might want to throw the error or handle it more gracefully
    // depending on your application's error handling strategy.
  }
}

// Export the initialized admin instance
export default admin;