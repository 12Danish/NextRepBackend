import express, { Router } from "express";
import {
  getDietGoalProgressController,
  getDietGraphProgressController,
  getWeightGraphProgressController,
  getWorkoutGoalProgressController,
  getWeightGoalProgressController,
  getWorkoutGraphProgressController,
  getSleepGraphStatsController,
  getOverviewStatsController,
  getTodayScheduleController,
  getCurrentMealPlanController,
  getOverviewGoalProgressController,
} from "../controllers/progressController";

import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/progress/DietGoalProgress/:goalId")
  .get(ValidationMiddleWare.validateToken(), getDietGoalProgressController);

router
  .route("/progress/WorkoutGraphProgress")
  .get(ValidationMiddleWare.validateToken(), getWorkoutGraphProgressController);

router
  .route("/progress/DietGraphProgress")
  .get(ValidationMiddleWare.validateToken(), getDietGraphProgressController);

router
  .route("/progress/WeightGoalProgress/:goalId")
  .get(ValidationMiddleWare.validateToken(), getWeightGoalProgressController);

router
  .route("/progress/WeightGraphProgress")
  .get(ValidationMiddleWare.validateToken(), getWeightGraphProgressController);

router
  .route("/progress/WorkoutGoalProgress/:goalId")
  .get(ValidationMiddleWare.validateToken(), getWorkoutGoalProgressController);

router
  .route("/progress/sleepStats")
  .get(ValidationMiddleWare.validateToken(), getSleepGraphStatsController);

// New overview routes
router
  .route("/overview/stats")
  .get(ValidationMiddleWare.validateToken(), getOverviewStatsController);

router
  .route("/overview/schedule")
  .get(ValidationMiddleWare.validateToken(), getTodayScheduleController);

router
  .route("/overview/mealplan")
  .get(ValidationMiddleWare.validateToken(), getCurrentMealPlanController);

router
  .route("/overview/goalprogress")
  .get(ValidationMiddleWare.validateToken(), getOverviewGoalProgressController);

export default router;
