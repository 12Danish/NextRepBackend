import { User } from "../models/UserModel";
import bcrypt from "bcryptjs";
import { CustomError } from "../utils/customError";
import { generateToken } from "../utils/jwtUtils";
import firebaseAdminAuth from "../config/firebaseAdminCofig";
interface UserRegisterInput {
  username: string;
  email: string;
  password: string;
}

interface UserCustomLoginInput {
  email: string;
  password: string;
}

class UserAuthServices {
  static async userRegisterService({
    username,
    email,
    password,
  }: UserRegisterInput) {
    // 1. Check if a user already exists with the same email and local auth
    const existingUser = await User.findOne({
      email: email,
      authProvider: "local",
    });

    if (existingUser) {
      // Throw an error or return a message
      throw new CustomError("User already exists with this email", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 2);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      authProvider: "local",
    });

    return newUser;
  }

  static async userCustomLoginService({
    email,
    password,
  }: UserCustomLoginInput) {
    // Find the user by email and local provider
    const user = await User.findOne({
      email,
      authProvider: "local",
    });

    if (!user) {
      throw new CustomError(
        "User with this email not found for local auth",
        401
      );
    }

    // Compare passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password ?? "");

    // If user authentiation fails return
    if (!isPasswordValid) {
      throw new CustomError("Invalid email or password", 401);
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      authProvider: user.authProvider,
    });
    console.log("returning: ", user);
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        authProvider: user.authProvider,
      },
    };
  }

  static async userFirebaseLoginService(firebaseToken: string) {
    const decoded = await firebaseAdminAuth.verifyIdToken(firebaseToken);

    console.log("[ Decoded Firebase Token]:", decoded);

    const firebaseUid = decoded.uid;
    const email = decoded.email ?? `${firebaseUid}@noemail.com`;

    const rawAuthProvider = decoded.firebase.sign_in_provider;
    let authProvider: "google" | "github";

    if (rawAuthProvider === "google.com") {
      authProvider = "google";
    } else if (rawAuthProvider === "github.com") {
      authProvider = "github";
    } else {
      throw new CustomError("Unsupported auth provider", 400);
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      try {
        user = await User.create({
          email,
          authProvider,
          firebaseUid,
          username: decoded.name ?? "User",
        });
      } catch (error) {
        throw new CustomError(
          `The following error occurred while trying to create user with firebase: ${error}`,
          500
        );
      }
    }
    if (user && !user.username && decoded.name) {
      user.username = decoded.name;
      await user.save();
    }
    const token = generateToken({
      id: user._id,
      email: user.email,
      authProvider: user.authProvider,
    });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}

export default UserAuthServices;
