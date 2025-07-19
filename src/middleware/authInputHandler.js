"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleWare = void 0;
const express_validator_1 = require("express-validator");
const customError_1 = require("../utils/customError");
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
            (0, express_validator_1.body)("username").trim().notEmpty().withMessage("Username is required"),
            (0, express_validator_1.body)("email")
                .trim()
                .notEmpty()
                .withMessage("Email is required")
                .isEmail()
                .withMessage("Email needs to be in valid format e.g 'john.doe@example.com' "),
            (0, express_validator_1.body)("password").trim().notEmpty().withMessage("Password is required"),
            (req, res, next) => {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    const error = new customError_1.CustomError("Error with the input received", 400, errors.array());
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
            (0, express_validator_1.body)("email")
                .trim()
                .notEmpty()
                .withMessage("Email is required")
                .isEmail()
                .withMessage("Email needs to be in valid format e.g 'john.doe@example.com' "),
            (0, express_validator_1.body)("password").trim().notEmpty().withMessage("Password is required"),
            (req, res, next) => {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    const error = new customError_1.CustomError("Error with the input received", 400, errors.array());
                    return next(error);
                }
                next();
            },
        ];
    }
}
exports.ValidationMiddleWare = ValidationMiddleWare;
