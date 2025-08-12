import express, { Router } from "express";
import {
  addWorkoutController,
  getWorkoutSchedule,
  deleteWorkoutController,
  updateWorkoutController,
} from "../controllers/workoutController";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
import WorkoutValidationMiddleware from "../middleware/workoutInputHandler";
const router: Router = express.Router();

router
  .route("/workout/create")
  .post(
    ValidationMiddleWare.validateToken(),
    WorkoutValidationMiddleware.validateRepsOrDurationInInput(),
    addWorkoutController
  );

router
  .route("/workout/getSchedule")
  .get(ValidationMiddleWare.validateToken(), getWorkoutSchedule);

router
  .route("/workout/updateWorkout/:id")
  .patch(
    ValidationMiddleWare.validateToken(),
    WorkoutValidationMiddleware.validateWorkoutIdInParams(),
    updateWorkoutController
  );

router
  .route("/workout/deleteWorkout/:id")
  .delete(
    ValidationMiddleWare.validateToken(),
    WorkoutValidationMiddleware.validateWorkoutIdInParams(),
    deleteWorkoutController
  );

export default router;
