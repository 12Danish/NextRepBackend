import express, { Router } from "express";
import {
  addWorkoutController,
  getWorkoutSchedule,
  deleteWorkoutController,
  updateWorkoutController,
} from "../controllers/workoutController";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/workout/create")
  .post(ValidationMiddleWare.validateToken(), addWorkoutController);

router
  .route("/workout/getSchedule")
  .get(ValidationMiddleWare.validateToken(), getWorkoutSchedule);

router
  .route("/workout/updateWorkout/:id")
  .post(ValidationMiddleWare.validateToken(), updateWorkoutController);

router
  .route("workout/deleteWorkout/:id")
  .delete(ValidationMiddleWare.validateToken(), deleteWorkoutController);
