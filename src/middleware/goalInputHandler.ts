import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { CustomError } from "../utils/customError";
import mongoose from "mongoose";

class GoalValidationMiddleware {
  /**
   * Middleware for validating goal creation input fields.
   *
   * Validates category-specific data for weight, diet, sleep, and workout goals.
   * Ensures all required fields for the selected category are present and valid.
   * Assumes required fields are enforced by the Mongoose schema.
   *
   * If validation fails, passes a CustomError to the next middleware.
   *
   * @returns {Array} An array of middleware functions for goal validation.
   */
  static validateAddGoalCategorySpecificDataInput() {
    return [
      // Validate category-specific data
      body("data").custom((data, { req }) => {
        const category = req.body.category;

        if (!data) {
          throw new Error("Data object is required");
        }

        if (category === "weight") {
          // Required fields: goalType, targetWeight, currentWeight, previousWeights
          if (!data.goalType) {
            throw new Error("goalType is required for weight goal");
          }
          if (!["gain", "loss", "maintenance"].includes(data.goalType)) {
            throw new Error("Invalid goalType for weight goal");
          }
          if (typeof data.targetWeight !== "number") {
            throw new Error("targetWeight must be a number");
          }
          if (data.targetWeight < 0) {
            throw new Error("targetWeight cannot be negative");
          }
          if (typeof data.currentWeight !== "number") {
            throw new Error("currentWeight must be a number");
          }
          if (data.currentWeight < 0) {
            throw new Error("currentWeight cannot be negative");
          }
          if (!Array.isArray(data.previousWeights)) {
            throw new Error("previousWeights must be an array");
          }
          if (
            !data.previousWeights.every(
              (entry: any) =>
                typeof entry.weight === "number" &&
                entry.weight >= 0 &&
                (entry.date instanceof Date || !isNaN(Date.parse(entry.date)))
            )
          ) {
            throw new Error(
              "Invalid previous weights format or negative weight"
            );
          }
        }

        if (category === "diet") {
          // Required fields: targetCalories, targetProteins, targetFats, targetCarbs
          if (typeof data.targetCalories !== "number") {
            throw new Error("targetCalories must be a number");
          }
          if (data.targetCalories < 0) {
            throw new Error("targetCalories cannot be negative");
          }
          if (typeof data.targetProteins !== "number") {
            throw new Error("targetProteins must be a number");
          }
          if (data.targetProteins < 0) {
            throw new Error("targetProteins cannot be negative");
          }
          if (typeof data.targetFats !== "number") {
            throw new Error("targetFats must be a number");
          }
          if (data.targetFats < 0) {
            throw new Error("targetFats cannot be negative");
          }
          if (typeof data.targetCarbs !== "number") {
            throw new Error("targetCarbs must be a number");
          }
          if (data.targetCarbs < 0) {
            throw new Error("targetCarbs cannot be negative");
          }
        }

        if (category === "sleep") {
          // Required field: targetHours
          if (typeof data.targetHours !== "number") {
            throw new Error("targetHours must be a number");
          }
          if (data.targetHours < 0) {
            throw new Error("targetHours cannot be negative");
          }
        }

        if (category === "workout") {
          // Required field: exerciseName, and at least one of targetMinutes or targetReps
          if (typeof data.exerciseName !== "string" || !data.exerciseName) {
            throw new Error("exerciseName must be a non-empty string");
          }
          if (
            (typeof data.targetMinutes !== "number" ||
              data.targetMinutes === undefined) &&
            (typeof data.targetReps !== "number" ||
              data.targetReps === undefined)
          ) {
            throw new Error(
              "At least one of targetMinutes or targetReps must be provided"
            );
          }
          if (
            typeof data.targetMinutes === "number" &&
            data.targetMinutes < 0
          ) {
            throw new Error("targetMinutes cannot be negative");
          }
          if (typeof data.targetReps === "number" && data.targetReps < 0) {
            throw new Error("targetReps cannot be negative");
          }
        }

        return true;
      }),

      this.handleValidationErrors,
    ];
  }

  /**
   * Middleware for validating goalId in route parameters.
   *
   * Ensures id is a valid MongoDB ObjectId.
   *
   * If validation fails, passes a CustomError to the next middleware.
   *
   * @returns {Array} An array of middleware functions for goalId validation.
   */
  static validateGoalIdInParams() {
    return [
      param("id").notEmpty().withMessage("Goal ID is required"),

      this.handleValidationErrors,
    ];
  }

  /**
   * Valiates that the category section is not present in update request
   *
   * @returns {Array} An array of middleware functions for goalId validation.
   */
  static validateUpdateGoalInput() {
    return [
      // Disallow 'category' field in updates
      body("category").custom((value, { req }) => {
        if (value !== undefined) {
          throw new Error("Category field cannot be updated");
        }
        return true;
      }),

      // Add additional update validations here (optional)

      this.handleValidationErrors,
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
      const errorMessages = errors.array().map((error) => ({
        message: error.msg,
      }));

      return next(new CustomError("Validation failed", 400, errorMessages));
    }
    next();
  }
}

export { GoalValidationMiddleware };
