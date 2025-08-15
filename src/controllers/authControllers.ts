import { NextFunction, Request, Response } from "express";
import UserAuthServices from "../services/authServices";

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

const registerUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    const newUser = await UserAuthServices.userRegisterService({
      username,
      email,
      password,
    });

    // Generate JWT token for the newly registered user
    const { generateToken } = require("../utils/jwtUtils");
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      authProvider: newUser.authProvider,
    });

    // Set JWT token in client cookie (same as login)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Will be false for localhost in dev.
      sameSite: "lax", // Allow cross-origin cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res
      .status(200)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err: any) {
    next(err);
  }
};

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
const customLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await UserAuthServices.userCustomLoginService({
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
  } catch (err: any) {
    next(err);
  }
};

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
const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set true in production
      sameSite: "none",
    });

    res.status(200).json({ message: "Successfully logged out" });
  } catch (err: any) {
    next(err);
  }
};

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
const firebaseLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firebaseToken } = req.body;

    const { token, user } =
      await UserAuthServices.userFirebaseLoginService(firebaseToken);
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
  } catch (err: any) {
    next(err);
  }
};

export {
  firebaseLoginController,
  logoutController,
  customLoginController,
  registerUserController,
};
