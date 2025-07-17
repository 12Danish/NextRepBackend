import admin from "firebase-admin";
import path from "path";

// Load the service account key
const serviceAccount = require(
  path.resolve(__dirname, "../serviceAccountKey.json")
); // Update path as needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), 
  });
}

const firebaseAdminAuth = admin.auth(); // Export auth module for use in the backend

export default firebaseAdminAuth;
