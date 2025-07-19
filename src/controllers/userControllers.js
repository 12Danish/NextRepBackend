"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserController = exports.customLoginController = exports.logoutController = exports.firebaseLoginController = void 0;
const authServices_1 = __importDefault(require("../services/authServices"));
/**
 * @desc    Controller for users to register locally
 * @route   POST /api/userRegister
 * @access  Public
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * {
 *   "username": "string",       // Desired username
 *   "email": "string",          // User's email address
 *   "password": "string"        // User's password
 * }
 *
 * @returns
 * {
 *   "message": "User registered successfully",
 *   "user": {
 *      "username" : "string",
 *     "email": "string",
 *     "authProvider": "local",
 *      "createdAt" : "Date",
 *      "updatedAt" : "Date"
 *   }
 *   @errors
 * - 500 in case of unexpected error
 *
 */
const registerUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const newUser = yield authServices_1.default.userRegisterService({
            username,
            email,
            password,
        });
        res
            .status(200)
            .json({ message: "User registered successfully", user: newUser });
    }
    catch (err) {
        next(err);
    }
});
exports.registerUserController = registerUserController;
/**
 * @desc    Controller for users to login via JWT
 * @route   POST /api/customLogin
 * @access  Public
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * {
 *   "email": "string",       // User's registered email address
 *   "password": "string"     // User's password
 * }
 *
 * @cookies
 * Set-Cookie: token=JWT_TOKEN; HttpOnly; Secure; SameSite=None; Max-Age=86400
 *
 * @returns
 * {
 *   "message": "Login successful",
 *   "user": {
 *     "email": "string",
 *     "authProvider": "local"
 *   }
 *   @errors
 * - 500 in case of unexpected error
 * - 401 in case of wrong password or user not found
 *
 */
const customLoginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { token, user } = yield authServices_1.default.userCustomLoginService({
            email,
            password,
        });
        // Set JWT token in client cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Will be false for localhost in dev.
            sameSite: "lax", // Allow cross-origin cookies
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        // Return success response with user data
        res.status(200).json({
            message: "Login successful",
            user,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.customLoginController = customLoginController;
/**
 * @desc    Logout user by clearing the authentication token cookie
 * @route   GET /api/logout
 * @access  Private
 *
 * @sets-cookie
 * Clears the HTTP-only cookie named `token` by setting its expiration
 *
 * @returns
 * {
 *   "message": "Successfully logged out"
 * }
 */
const logoutController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set true in production
            sameSite: "none",
        });
        res.status(200).json({ message: "Successfully logged out" });
    }
    catch (err) {
        next(err);
    }
});
exports.logoutController = logoutController;
/**
 * @desc    Login user using Firebase token (Google/GitHub login)
 * @route   POST /api/firebaseLogin
 * @access  Public
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * {
 *   "firebaseToken": "string" // Firebase ID token obtained from client after Google/GitHub login
 * }
 *
 * @cookies
 * Sets an HTTP-only cookie named `token` containing the JWT for session management
 *
 * @returns
 * {
 *   "message": "Login successful",
 *   "user": {
 *     "email": "string",
 *     "authProvider": "google | github"
 *   }
 *
 * @errors
 * - 500 in case of unexpected error
 * }
 */
const firebaseLoginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firebaseToken } = req.body;
        const { token, user } = yield authServices_1.default.userFirebaseLoginService(firebaseToken);
        // Set the token in a cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: "lax", // Allow cross-origin cookies
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        // Return the user details and a success message
        res.status(200).json({
            message: "Login successful",
            user,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.firebaseLoginController = firebaseLoginController;
