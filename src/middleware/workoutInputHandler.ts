import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { CustomError } from "../utils/customError";

class WorkoutValidationMiddleware {
  static validateRepsOrDurationInInput() {
    return [
      body().custom((value) => {
        if (!value.reps && !value.duration) {
          throw new CustomError("Either duration or reps is needed", 400);
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
  static validateWorkoutIdInParams() {
    return [
      param("id").notEmpty().withMessage("Workout ID is required"),

      this.handleValidationErrors,
    ];
  }

  /**
   * Generic error handler for validation errors.
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

export default WorkoutValidationMiddleware;
