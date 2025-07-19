"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
// Load the service account key
const serviceAccount = require(path_1.default.resolve(__dirname, "../serviceAccountKey.json")); // Update path as needed
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
const firebaseAdminAuth = firebase_admin_1.default.auth(); // Export auth module for use in the backend
exports.default = firebaseAdminAuth;
