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
     * - `userId` is not empty and valid MongoDB ObjectId.
     * - `foodName` is not empty after trimming.
     * - `meal` is one of the valid meal types.
     * - `calories`, `carbs`, `protein`, and `fat` are numbers within reasonable limits.
     * - `status` is optional but must be valid if provided.
     * - `goalId` is optional but must be valid MongoDB ObjectId if provided.
     * 
     * @returns {Array} An array of middleware functions to use in an Express route.
     */
  static validateCreateDietInput() {
    return [
      body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isMongoId()
        .withMessage("Invalid user ID format"),
      body("foodName")
        .trim()
        .notEmpty()
        .withMessage("Food name is required")
        .isLength({ max: 200 })
        .withMessage("Food name must be less than 200 characters"),
      body("meal")
        .isIn(["breakfast", "lunch", "dinner", "snack"])
        .withMessage("Meal must be one of: breakfast, lunch, dinner, snack"),
      body("calories")
        .isFloat({ min: 0, max: 10000 })
        .withMessage("Calories must be a number between 0 and 10000"),
      body("carbs")
        .isFloat({ min: 0, max: 1000 })
        .withMessage("Carbs must be a number between 0 and 1000"),
      body("protein")
        .isFloat({ min: 0, max: 1000 })
        .withMessage("Protein must be a number between 0 and 1000"),
      body("fat")
        .isFloat({ min: 0, max: 1000 })
        .withMessage("Fat must be a number between 0 and 1000"),
      body("status")
        .optional()
        .isIn(["taken", "next", "overdue", "skipped"])
        .withMessage("Status must be one of: taken, next, overdue, skipped"),
      body("goalId")
        .optional()
        .isMongoId()
        .withMessage("Invalid goal ID format"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating diet update input.
   * 
   * Validates that:
   * - `foodName` is optional but cannot be empty if provided.
   * - `meal` is optional but must be valid if provided.
   * - `calories`, `carbs`, `protein`, and `fat` are optional but must be numbers within limits if provided.
   * - `status` is optional but must be valid if provided.
   * - `goalId` is optional but must be valid MongoDB ObjectId if provided.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateUpdateDietInput() {
    return [
      body("foodName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Food name cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Food name must be less than 200 characters"),
      body("meal")
        .optional()
        .isIn(["breakfast", "lunch", "dinner", "snack"])
        .withMessage("Meal must be one of: breakfast, lunch, dinner, snack"),
      body("calories")
        .optional()
        .isFloat({ min: 0, max: 10000 })
        .withMessage("Calories must be a number between 0 and 10000"),
      body("carbs")
        .optional()
        .isFloat({ min: 0, max: 1000 })
        .withMessage("Carbs must be a number between 0 and 1000"),
      body("protein")
        .optional()
        .isFloat({ min: 0, max: 1000 })
        .withMessage("Protein must be a number between 0 and 1000"),
      body("fat")
        .optional()
        .isFloat({ min: 0, max: 1000 })
        .withMessage("Fat must be a number between 0 and 1000"),
      body("status")
        .optional()
        .isIn(["taken", "next", "overdue", "skipped"])
        .withMessage("Status must be one of: taken, next, overdue, skipped"),
      body("goalId")
        .optional()
        .isMongoId()
        .withMessage("Invalid goal ID format"),
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
      param("dietId")
        .notEmpty()
        .withMessage("Diet ID is required")
        .isMongoId()
        .withMessage("Invalid diet ID format"),
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
      param("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isMongoId()
        .withMessage("Invalid user ID format"),
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
        .notEmpty()
        .withMessage("Date is required")
        .isISO8601()
        .toDate()
        .withMessage("Date must be in ISO 8601 format (YYYY-MM-DD)"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating query parameters for diet filtering.
   * 
   * Validates that:
   * - `userId` is valid MongoDB ObjectId if provided.
   * - `meal` is valid meal type if provided.
   * - `status` is valid status if provided.
   * - `startDate` and `endDate` are valid ISO dates if provided.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateDietFiltersQuery() {
    return [
      query("userId")
        .optional()
        .isMongoId()
        .withMessage("Invalid user ID format"),
      query("meal")
        .optional()
        .isIn(["breakfast", "lunch", "dinner", "snack"])
        .withMessage("Meal must be one of: breakfast, lunch, dinner, snack"),
      query("status")
        .optional()
        .isIn(["taken", "next", "overdue", "skipped"])
        .withMessage("Status must be one of: taken, next, overdue, skipped"),
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
   * Middleware for validating pagination query parameters.
   * 
   * Validates that:
   * - `page` is a positive integer if provided.
   * - `limit` is a positive integer if provided.
   * - `sortBy` is valid sort field if provided.
   * - `sortOrder` is valid sort order if provided.
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
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be a positive integer between 1 and 100"),
      query("sortBy")
        .optional()
        .isIn(["createdAt", "updatedAt", "calories", "foodName"])
        .withMessage("Sort by must be one of: createdAt, updatedAt, calories, foodName"),
      query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be either 'asc' or 'desc'"),
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
   * - `q` (search query) is required and must be a non-empty string.
   * 
   * @returns {Array} An array of middleware functions to use in an Express route.
   */
  static validateSearchQuery() {
    return [
      query("q")
        .notEmpty()
        .withMessage("Search query is required")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Search query must be between 1 and 100 characters"),
      ValidationMiddleware.handleValidationErrors,
    ];
  }

  /**
   * Generic error handler for validation errors.
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  private static handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        message: error.msg,
      }));
      
      return next(
        new CustomError("Validation failed", 400, errorMessages)
      );
    }
    next();
  }
}

export { ValidationMiddleware };
