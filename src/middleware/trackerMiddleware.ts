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
      body("workoutOrDietData")
        .isObject()
        .withMessage("workoutOrDietData must be an object"),

      body("workoutOrDietData").custom((value, { req }) => {
        
        if (req.body.type === "workout") {
            // For workout, just ensure both fields exist (can be 0)
          if (value.completedReps === undefined || value.completedTime === undefined) {
            return false; 
          }
        }
        
        if (req.body.type === "diet") {
          if (value.weightConsumed === undefined) {
            return false; 
          }
        }
        
        return true;
      }).withMessage("Required tracking data is missing"),

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
