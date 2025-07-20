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
            body("userId").notEmpty().withMessage("User ID is required").isMongoId().withMessage("Invalid user ID format"),
            body("duration")
                .notEmpty().withMessage("Duration is required")
                .isNumeric().withMessage("Duration must be a number")
                .isFloat({ min: 0, max: 1440 }).withMessage("Duration must be between 0 and 1440 minutes (24 hours)"),
            body("date")
                .notEmpty().withMessage("Date is required")
                .isISO8601().withMessage("Invalid date format")
                .custom((value) => {
                    const date = new Date(value);
                    const now = new Date();
                    if (date > now) {
                        throw new Error("Date cannot be in the future");
                    }
                    return true;
                }),
            body("goalId").notEmpty().withMessage("Goal ID is required").isMongoId().withMessage("Invalid goal ID format"),
        ]
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
                .isNumeric().withMessage("Duration must be a number")
                .isFloat({ min: 0, max: 1440 }).withMessage("Duration must be between 0 and 1440 minutes (24 hours)"),
            body("date")
                .optional()
                .isISO8601().withMessage("Invalid date format")
                .custom((value) => {
                    const date = new Date(value);
                    const now = new Date();
                    if (date > now) {
                        throw new Error("Date cannot be in the future");
                    }
                    return true;
                }),
            body("goalId").optional().isMongoId().withMessage("Invalid goal ID format"),
        ]
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
            param("sleepId").notEmpty().withMessage("Sleep ID is required").isMongoId().withMessage("Invalid sleep ID format"),
        ]
    }

    /**
     * Middleware for validating user id parameter.
     * 
     * Validates that:
     * - `userId` is not empty and valid MongoDB ObjectId.
     * 
     * @returns An array of middleware functions to use in an Express route.
     */
    static validateUserIdParam() {
        return [
            param("userId").notEmpty().withMessage("User ID is required").isMongoId().withMessage("Invalid user ID format"),
        ]   
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
                .notEmpty().withMessage("Date is required")
                .isISO8601().withMessage("Invalid date format")
                .custom((value) => {
                    const date = new Date(value);
                    const now = new Date();
                    if (date > now) {
                        throw new Error("Date cannot be in the future");
                    }
                    return true;
                }),
        ]
    }

    /**
     * Middleware for validating query parameters for sleep listing.
     * 
     * Validates that:
     * - `page` is a positive integer.
     * - `limit` is a positive integer between 1 and 100.
     * - `sortBy` is a valid field name.
     * - `sortOrder` is either 'asc' or 'desc'.
     * - `startDate` and `endDate` are valid dates.
     * 
     * @returns An array of middleware functions to use in an Express route.
     */
    static validateSleepQueryParams() {
        return [
            query("page")
                .optional()
                .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
            query("limit")
                .optional()
                .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
            query("sortBy")
                .optional()
                .isIn(["createdAt", "updatedAt", "date", "duration"]).withMessage("Invalid sort field"),
            query("sortOrder")
                .optional()
                .isIn(["asc", "desc"]).withMessage("Sort order must be 'asc' or 'desc'"),
            query("startDate")
                .optional()
                .isISO8601().withMessage("Invalid start date format"),
            query("endDate")
                .optional()
                .isISO8601().withMessage("Invalid end date format"),
        ]
    }

    /**
     * Middleware for validating date range parameters.
     * 
     * Validates that:
     * - `startDate` and `endDate` are valid dates.
     * - `startDate` is not after `endDate`.
     * 
     * @returns An array of middleware functions to use in an Express route.
     */
    static validateDateRangeParams() {
        return [
            param("startDate")
                .notEmpty().withMessage("Start date is required")
                .isISO8601().withMessage("Invalid start date format"),
            param("endDate")
                .notEmpty().withMessage("End date is required")
                .isISO8601().withMessage("Invalid end date format"),
            param("startDate").custom((startDate, { req }) => {
                const start = new Date(startDate);
                const end = new Date(req.params?.endDate || '');
                if (start > end) {
                    throw new Error("Start date cannot be after end date");
                }
                return true;
            }),
        ]
    }

    /**
     * Middleware for validating multiple sleep creation input.
     * 
     * Validates that:
     * - Input is an array.
     * - Each item has required fields.
     * - Duration and date constraints are met.
     * 
     * @returns An array of middleware functions to use in an Express route.
     */
    static validateMultipleSleepInput() {
        return [
            body()
                .isArray().withMessage("Input must be an array")
                .notEmpty().withMessage("Array cannot be empty"),
            body("*.userId")
                .notEmpty().withMessage("User ID is required for all entries")
                .isMongoId().withMessage("Invalid user ID format"),
            body("*.duration")
                .notEmpty().withMessage("Duration is required for all entries")
                .isNumeric().withMessage("Duration must be a number")
                .isFloat({ min: 0, max: 1440 }).withMessage("Duration must be between 0 and 1440 minutes"),
            body("*.date")
                .notEmpty().withMessage("Date is required for all entries")
                .isISO8601().withMessage("Invalid date format")
                .custom((value) => {
                    const date = new Date(value);
                    const now = new Date();
                    if (date > now) {
                        throw new Error("Date cannot be in the future");
                    }
                    return true;
                }),
            body("*.goalId")
                .notEmpty().withMessage("Goal ID is required for all entries")
                .isMongoId().withMessage("Invalid goal ID format"),
        ]
    }

    /**
     * Middleware for validating search query parameters.
     * 
     * Validates that:
     * - `searchQuery` is not empty and has minimum length.
     * 
     * @returns An array of middleware functions to use in an Express route.
     */
    static validateSearchQueryParams() {
        return [
            query("searchQuery")
                .notEmpty().withMessage("Search query is required")
                .isLength({ min: 2 }).withMessage("Search query must be at least 2 characters long"),
        ]
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
    static handleValidationErrors(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            throw new CustomError(`Validation failed: ${errorMessages.join(', ')}`, 400);
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
    static validateAtLeastOneUpdateField(req: Request, res: Response, next: NextFunction) {
        const { duration, date, goalId } = req.body;
        if (!duration && !date && !goalId) {
            throw new CustomError("At least one field (duration, date, or goalId) must be provided for update", 400);
        }
        next();
    }
}

export default SleepInputHandler;