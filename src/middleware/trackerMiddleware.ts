import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { CustomError } from "../utils/customError";

class TrackerValidationMiddleware {
  /**
   * Middleware to validate adding a tracker
   */
  static validateAddTrackerInput() {
    return [
      body("type")
        .isIn(["sleep", "workout", "diet"])
        .withMessage("type must be one of 'sleep', 'workout', or 'diet'"),

      // Conditional validation for workout
      body("workoutOrDietData").custom((value, { req }) => {
        if (req.body.type === "workout") {
          const hasReps = value.completedReps;
          const hasTime = value.completedTime;

          if (!hasReps && !hasTime) {
            throw new Error(
              "For type 'workout', either completedReps or completedTime must be provided"
            );
          }
        }
        return true;
      }),

      // Conditional validation for diet
      body("workoutOrDietData").custom((value, { req }) => {
        if (req.body.type === "diet") {
          if (!value.weightConsumed) {
            throw new Error(
              "For type 'diet', weightConsumed must be provided as a number"
            );
          }
        }
        return true;
      }),

      this.handleValidationErrors,
    ];
  }

  /**
   * Middleware to validate that either trackerId or referenceId is in params, but not both
   */
  static validateTrackerIdOrReferenceIdInParam() {
    return [
      param("trackerId")
        .optional()
        .isMongoId()
        .withMessage("trackerId must be a valid MongoDB ObjectId"),
      param("referenceId")
        .optional()
        .isMongoId()
        .withMessage("referenceId must be a valid MongoDB ObjectId"),

      (req: Request, res: Response, next: NextFunction) => {
        const { trackerId, referenceId } = req.params;

        if (!trackerId && !referenceId) {
          return next(
            new CustomError(
              "Either trackerId or referenceId must be provided",
              400
            )
          );
        }

        if (trackerId && referenceId) {
          return next(
            new CustomError(
              "Only one of trackerId or referenceId should be provided, not both",
              400
            )
          );
        }

        next();
      },

      this.handleValidationErrors,
    ];
  }

  /**
   * Shared validation error handler
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

export default TrackerValidationMiddleware;
