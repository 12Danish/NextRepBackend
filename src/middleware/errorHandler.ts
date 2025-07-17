// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/customError";

export const errorHandler = (
  err: any, //  Accepts both CustomError and unknown
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback for unknown errors
  console.error(err); // Optionally log stack trace

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
