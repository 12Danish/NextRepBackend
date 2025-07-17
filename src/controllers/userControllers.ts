import { NextFunction, Request, Response } from "express";
import UserAuthServices from "../services/authServices";

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
    res
      .status(200)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err: any) {
    next(err);
  }
};

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
