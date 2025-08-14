import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserDetailsServices } from "../services/userDetailsServices";

const updateUserDetailsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const updates = req.body;

    const updatedUser = await UserDetailsServices.updateUserDetailsService({
      userId,
      updates,
    });

    res.status(200).json({
      message: "User details updated successfully",
      updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

export { updateUserDetailsController };
