import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { CustomError } from "../utils/customError";

// This middleware class validates the fields coming in for diet-related operations
// It ensures they are non-empty and in the correct format

class ValidationMiddleware {
    /**
     * Middleware for validating diet creation input.
     * 
     * Validates that:
     * - `userId` is not empty.
     * - `food` is not empty after trimming.
     * - `calories` is a number.
     * - `protein`, `carbs`, and `fats` are optional but must be numbers if provided.
     * - `date` is optional but must be in ISO 860 
     * 
     * @returns {Array} An array of middleware functions to use in an Express route.
     */
  static validateCreateDietInput() {
    return [
      body("userId").notEmpty().withMessage("User ID is required"),
      body("food").trim().notEmpty().withMessage("Food name is required"),
      body("calories").isNumeric().withMessage("Calories must be a number"),
      body("protein")
        .optional()
        .isNumeric()
        .withMessage("Protein must be a number"),
      body("carbs")
        .optional()
        .isNumeric()
        .withMessage("Carbs must be a number"),
      body("fats")
        .optional()
        .isNumeric()
        .withMessage("Fats must be a number"),
      body("date")
        .optional()
        .isISO8601()
        .toDate()
        .withMessage("Date must be in ISO 8601 format"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating diet update input.
   * 
   * Validates that:
   * - `food` is optional but cannot be empty if provided.
   * - `calories`, `protein`, `carbs`, and `fats` are optional but must be numbers if provided.
   * - `date` is optional but must be in ISO 8601 format if provided
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateUpdateDietInput() {
    return [
      body("food").optional().trim().notEmpty().withMessage("Food cannot be empty"),
      body("calories")
        .optional()
        .isNumeric()
        .withMessage("Calories must be a number"),
      body("protein")
        .optional()
        .isNumeric()
        .withMessage("Protein must be a number"),
      body("carbs")
        .optional()
        .isNumeric()
        .withMessage("Carbs must be a number"),
      body("fats")
        .optional()
        .isNumeric()
        .withMessage("Fats must be a number"),
      body("date")
        .optional()
        .isISO8601()
        .toDate()
        .withMessage("Date must be in ISO 8601 format"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating diet ID parameter.
   * 
   * Validates that:
   * - `dietId` is a valid MongoDB ObjectId format.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateDietIdParam() {
    return [
      param("dietId").isMongoId().withMessage("Invalid diet ID format"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating user ID parameter.
   * 
   * Validates that:
   * - `userId` is a valid MongoDB ObjectId format.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */

  static validateUserIdParam() {
    return [
      param("userId").isMongoId().withMessage("Invalid user ID format"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating date parameter in URL (e.g. /user/:userId/date/:date).
   * 
   * Validates that:
   * - `date` is in ISO 8601 format.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateDateParam() {
    return [
      param("date")
        .isISO8601()
        .toDate()
        .withMessage("Date must be in ISO 8601 format (YYYY-MM-DD)"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating pagination query parameters.
   * 
   * Validates that:
   * - `page` is a positive integer if provided.
   * - `limit` is a positive integer if provided.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validatePaginationQuery() {
    return [
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
      query("limit")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Limit must be a positive integer"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating date range for summary endpoint.
   * 
   * Validates that:
   * - `startDate` is in ISO 8601 format if provided.
   * - `endDate` is in ISO 8601 format if provided.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateDateRangeQuery() {
    return [
      query("startDate")
        .optional()
        .isISO8601()
        .toDate()
        .withMessage("Start date must be in ISO 8601 format"),
      query("endDate")
        .optional()
        .isISO8601()
        .toDate()
        .withMessage("End date must be in ISO 8601 format"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware that validates search query parameters.
   * 
   * Validates that:
   * - `query` is optional but must be a string if provided.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateSearchQuery() {
    return [
      query("query")
        .optional()
        .trim()
        .isString()
        .withMessage("Search query must be a string"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * 
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  private static handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new CustomError("Validation failed", 400, errors.array())
      );
    }
    next();
  }
}

export { ValidationMiddleware };
