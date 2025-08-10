import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { CustomError } from "../utils/customError";
import jwt from "jsonwebtoken";

// This middleware class validates the fields coming in for registration and login
// It makes sure they are non empty along with correct format for email

class ValidationMiddleWare {
  /**
   * Middleware for validating user registration input fields.
   *
   * Validates that:
   * - `username` is not empty after trimming.
   * - `email` is not empty, trimmed, and in valid format.
   * - `password` is not empty after trimming.
   *
   * If validation fails, throws a CustomError with details.
   *
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateCustomRegisterInput() {
    return [
      body("username").trim().notEmpty().withMessage("Username is required"),
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage(
          "Email needs to be in valid format e.g 'john.doe@example.com' "
        ),
      body("password").trim().notEmpty().withMessage("Password is required"),

      (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const error = new CustomError(
            "Error with the input received",
            400,
            errors.array()
          );
          return next(error);
        }
        next();
      },
    ];
  }

  /**
   * Middleware for validating user login input fields.
   *
   * Validates that:
   * - `email` is not empty after trimming and is valid.
   * - `password` is not empty after trimming.
   *
   * If validation fails, throws a CustomError with details.
   *
   * @returns success and sets JWT token in cookies .
   */
  static validCustomLoginInput() {
    return [
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage(
          "Email needs to be in valid format e.g 'john.doe@example.com' "
        ),
      body("password").trim().notEmpty().withMessage("Password is required"),

      (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const error = new CustomError(
            "Error with the input received",
            400,
            errors.array()
          );
          return next(error);
        }
        next();
      },
    ];
  }

  /**
   * Middleware to validate JWT token from cookies.
   *
   * - Retrieves the JWT token from the `token` cookie.
   * - If token is missing, responds with a `401 Unauthorized` error.
   * - If token is invalid or expired, responds with a `403 Forbidden` error.
   * - If token is valid, attaches the decoded user payload to `req.user`.
   *
   * This middleware is typically used to protect routes that require
   * authentication.
   *
   * @returns {Function} An Express middleware function for token validation.
   */
  static validateToken() {
    return (req: any, response: Response, next: NextFunction) => {
      const token = req.cookies?.token;

      if (!token) {
        const error = new CustomError("No Token cookie in request", 401);
        return next(error);
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "sync");
        console.log("decoded")
        console.log(decoded)
        req.user = decoded;
        return next();
      } catch {
        const error = new CustomError("Invalid or Expired Token", 403);
        return next(error);
      }
    };
  }
}

export { ValidationMiddleWare };
