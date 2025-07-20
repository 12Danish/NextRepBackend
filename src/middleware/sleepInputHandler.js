"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SleepInputHandler = void 0;
const express_validator_1 = require("express-validator");
const customError_1 = require("../utils/customError");

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
            (0, express_validator_1.body)("userId")
                .notEmpty()
                .withMessage("User ID is required")
                .isMongoId()
                .withMessage("Invalid user ID format"),
            (0, express_validator_1.body)("duration")
                .notEmpty()
                .withMessage("Duration is required")
                .isNumeric()
                .withMessage("Duration must be a number")
                .isFloat({ min: 0, max: 1440 })
                .withMessage("Duration must be between 0 and 1440 minutes (24 hours)"),
            (0, express_validator_1.body)("date")
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
            (0, express_validator_1.body)("goalId")
                .notEmpty()
                .withMessage("Goal ID is required")
                .isMongoId()
                .withMessage("Invalid goal ID format"),
            SleepInputHandler.handleValidationErrors,
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
            (0, express_validator_1.body)("duration")
                .optional()
                .isNumeric()
                .withMessage("Duration must be a number")
                .isFloat({ min: 0, max: 1440 })
                .withMessage("Duration must be between 0 and 1440 minutes (24 hours)"),
            (0, express_validator_1.body)("date")
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
            (0, express_validator_1.body)("goalId")
                .optional()
                .isMongoId()
                .withMessage("Invalid goal ID format"),
            SleepInputHandler.handleValidationErrors,
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
            (0, express_validator_1.param)("sleepId")
                .notEmpty()
                .withMessage("Sleep ID is required")
                .isMongoId()
                .withMessage("Invalid sleep ID format"),
            SleepInputHandler.handleValidationErrors,
        ];
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
            (0, express_validator_1.param)("userId")
                .notEmpty()
                .withMessage("User ID is required")
                .isMongoId()
                .withMessage("Invalid user ID format"),
            SleepInputHandler.handleValidationErrors,
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
            (0, express_validator_1.param)("date")
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
            SleepInputHandler.handleValidationErrors,
        ];
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
            (0, express_validator_1.query)("page")
                .optional()
                .isInt({ min: 1 })
                .withMessage("Page must be a positive integer"),
            (0, express_validator_1.query)("limit")
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage("Limit must be between 1 and 100"),
            (0, express_validator_1.query)("sortBy")
                .optional()
                .isIn(["createdAt", "updatedAt", "date", "duration"])
                .withMessage("Sort by must be one of: createdAt, updatedAt, date, duration"),
            (0, express_validator_1.query)("sortOrder")
                .optional()
                .isIn(["asc", "desc"])
                .withMessage("Sort order must be 'asc' or 'desc'"),
            (0, express_validator_1.query)("startDate")
                .optional()
                .isISO8601()
                .withMessage("Invalid start date format"),
            (0, express_validator_1.query)("endDate")
                .optional()
                .isISO8601()
                .withMessage("Invalid end date format"),
            SleepInputHandler.handleValidationErrors,
        ];
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
            (0, express_validator_1.param)("startDate")
                .notEmpty()
                .withMessage("Start date is required")
                .isISO8601()
                .withMessage("Invalid start date format"),
            (0, express_validator_1.param)("endDate")
                .notEmpty()
                .withMessage("End date is required")
                .isISO8601()
                .withMessage("Invalid end date format"),
            (0, express_validator_1.param)("startDate")
                .custom((startDate, { req }) => {
                    const start = new Date(startDate);
                    const end = new Date(req.params?.endDate || '');
                    if (start > end) {
                        throw new Error("Start date cannot be after end date");
                    }
                    return true;
                }),
            SleepInputHandler.handleValidationErrors,
        ];
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
            (0, express_validator_1.body)()
                .isArray()
                .withMessage("Input must be an array")
                .notEmpty()
                .withMessage("Array cannot be empty"),
            (0, express_validator_1.body)("*.userId")
                .notEmpty()
                .withMessage("User ID is required for all entries")
                .isMongoId()
                .withMessage("Invalid user ID format"),
            (0, express_validator_1.body)("*.duration")
                .notEmpty()
                .withMessage("Duration is required for all entries")
                .isNumeric()
                .withMessage("Duration must be a number")
                .isFloat({ min: 0, max: 1440 })
                .withMessage("Duration must be between 0 and 1440 minutes"),
            (0, express_validator_1.body)("*.date")
                .notEmpty()
                .withMessage("Date is required for all entries")
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
            (0, express_validator_1.body)("*.goalId")
                .notEmpty()
                .withMessage("Goal ID is required for all entries")
                .isMongoId()
                .withMessage("Invalid goal ID format"),
            SleepInputHandler.handleValidationErrors,
        ];
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
            (0, express_validator_1.query)("searchQuery")
                .notEmpty()
                .withMessage("Search query is required")
                .isLength({ min: 2 })
                .withMessage("Search query must be at least 2 characters long"),
            SleepInputHandler.handleValidationErrors,
        ];
    }

    /**
     * Middleware for validating date range for summary endpoint.
     * 
     * Validates that:
     * - `startDate` is in ISO 8601 format if provided.
     * - `endDate` is in ISO 8601 format if provided.
     * 
     * @returns An array of middleware functions to use in an Express route.
     */
    static validateDateRangeQuery() {
        return [
            (0, express_validator_1.query)("startDate")
                .optional()
                .isISO8601()
                .withMessage("Start date must be in ISO 8601 format"),
            (0, express_validator_1.query)("endDate")
                .optional()
                .isISO8601()
                .withMessage("End date must be in ISO 8601 format"),
            SleepInputHandler.handleValidationErrors,
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
     * @returns An array of middleware functions to use in an Express route.
     */
    static validatePaginationQuery() {
        return [
            (0, express_validator_1.query)("page")
                .optional()
                .isInt({ min: 1 })
                .withMessage("Page must be a positive integer"),
            (0, express_validator_1.query)("limit")
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage("Limit must be a positive integer between 1 and 100"),
            (0, express_validator_1.query)("sortBy")
                .optional()
                .isIn(["createdAt", "updatedAt", "date", "duration"])
                .withMessage("Sort by must be one of: createdAt, updatedAt, date, duration"),
            (0, express_validator_1.query)("sortOrder")
                .optional()
                .isIn(["asc", "desc"])
                .withMessage("Sort order must be either 'asc' or 'desc'"),
            SleepInputHandler.handleValidationErrors,
        ];
    }

    /**
     * Generic error handler for validation errors.
     * 
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function
     */
    static handleValidationErrors(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => ({
                message: error.msg,
            }));
            
            return next(
                new customError_1.CustomError("Validation failed", 400, errorMessages)
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
    static validateAtLeastOneUpdateField(req, res, next) {
        const { duration, date, goalId } = req.body;
        if (!duration && !date && !goalId) {
            throw new customError_1.CustomError("At least one field (duration, date, or goalId) must be provided for update", 400);
        }
        next();
    }
}

exports.SleepInputHandler = SleepInputHandler;