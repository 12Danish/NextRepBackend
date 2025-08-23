import admin from "firebase-admin";
import dotenv from "dotenv";

const mode = process.env.MODE || 'development';
const envFile = `.env.${mode}`;
dotenv.config({ path: envFile });

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountString) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (error) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", error);
  throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON format");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      ...serviceAccount,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"), // fix newlines
    }),
  });
}

const firebaseAdminAuth = admin.auth();

export default firebaseAdminAuth;
