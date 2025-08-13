import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { CustomError } from "../utils/customError";

//This middleware class validates the fields coming in for sleep-related operations
//It ensures they are non-empty and in the correct format

class SleepInputHandler {
  /**
   * Middleware for validating sleep creation input.
   *
   * Validates that:
   * - `userId` is not empty and valid MongoDB ObjectId.
   * - `duration` is a number between 0 and 1440 (24 hours in minutes).
   * - `date` is a valid date and not in the future.
   * - `goalId` is not empty and valid MongoDB ObjectId.
   * @returns An array of middleware functions to use in an Express route.
   */
  static validateCreateSleepInput() {
    return [
      body("duration")
        .notEmpty()
        .withMessage("Duration is required")
        .isNumeric()
        .withMessage("Duration must be a number")
        .isFloat({ min: 0, max: 1440 })
        .withMessage("Duration must be between 0 and 1440 minutes (24 hours)"),
      body("date")
        .notEmpty()
        .withMessage("Date is required")
        .isISO8601()
        .withMessage("Invalid date format")
        .custom((value) => {
          const date = new Date(value);
          const now = new Date();
          if (date > now) {
            throw new Error("Date cannot be in the future");
          }
          return true;
        }),
    ];
  }

  /**
   * Middleware for validating sleep update input.
   *
   * Validates that:
   * - `duration` is a number between 0 and 1440 (24 hours in minutes).
   * - `date` is a valid date and not in the future.
   * - `goalId` is not empty and valid MongoDB ObjectId.
   *
   * @returns An array of middleware functions to use in an Express route.
   */
  static validateUpdateSleepInput() {
    return [
      body("duration")
        .optional()
        .isNumeric()
        .withMessage("Duration must be a number")
        .isFloat({ min: 0, max: 1440 })
        .withMessage("Duration must be between 0 and 1440 minutes (24 hours)"),
      body("date")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format")
        .custom((value) => {
          const date = new Date(value);
          const now = new Date();
          if (date > now) {
            throw new Error("Date cannot be in the future");
          }
          return true;
        }),
      body("goalId")
        .optional()
        .isMongoId()
        .withMessage("Invalid goal ID format"),
    ];
  }

  /**
   * Middleware for validating sleep id parameter.
   *
   * Validates that:
   * - `sleepId` is not empty and valid MongoDB ObjectId.
   *
   * @returns An array of middleware functions to use in an Express route.
   */
  static validateSleepIdParam() {
    return [
      param("sleepId")
        .notEmpty()
        .withMessage("Sleep ID is required")
        .isMongoId()
        .withMessage("Invalid sleep ID format"),
    ];
  }

  /**
   * Middleware for validating date parameter.
   *
   * Validates that:
   * - `date` is a valid date and not in the future.
   *
   * @returns An array of middleware functions to use in an Express route.
   */
  static validateDateParam() {
    return [
      param("date")
        .notEmpty()
        .withMessage("Date is required")
        .isISO8601()
        .withMessage("Invalid date format")
        .custom((value) => {
          const date = new Date(value);
          const now = new Date();
          if (date > now) {
            throw new Error("Date cannot be in the future");
          }
          return true;
        }),
    ];
  }

  /**
   * Middleware to handle validation errors.
   *
   * Checks for validation errors and throws a CustomError if any are found.
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  static handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      throw new CustomError(
        `Validation failed: ${errorMessages.join(", ")}`,
        400
      );
    }
    next();
  }

  /**
   * Middleware to check if at least one update field is provided.
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  static validateAtLeastOneUpdateField(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { duration, date, goalId } = req.body;
    if (!duration && !date && !goalId) {
      throw new CustomError(
        "At least one field (duration, date, or goalId) must be provided for update",
        400
      );
    }
    next();
  }
}

export default SleepInputHandler;
