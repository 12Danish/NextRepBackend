import express, { Router } from "express";
import {
  addGoalController,
  getGoalsController,
  getGoalsCountController,
  deleteGoalController,
  getOverallProgressController,
  getUpcomingGoalsController,
  updateGoalDetailsController,
  UpdateGoalsOverdueStatusController,
  markGoalAsCompletedController,
} from "../controllers/goalControllers";

import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/goal/add")
  .post(ValidationMiddleWare.validateToken(), addGoalController);

router
  .route("/goal/delete/:id")
  .delete(ValidationMiddleWare.validateToken(), deleteGoalController);

router
  .route("/goal/updateDetails/:id")
  .post(ValidationMiddleWare.validateToken(), updateGoalDetailsController);

router
  .route("/goal/getGoals")
  .get(ValidationMiddleWare.validateToken(), getGoalsController);

router
  .route("/goal/getGoalsCounter")
  .get(ValidationMiddleWare.validateToken(), getGoalsCountController);

router
  .route("/goal/getOverallProgress")
  .get(ValidationMiddleWare.validateToken(), getOverallProgressController);

router
  .route("/goal/getUpcomingGoals")
  .get(ValidationMiddleWare.validateToken(), getUpcomingGoalsController);

router
  .route("/goal/markCompleted/:id")
  .get(ValidationMiddleWare.validateToken(), markGoalAsCompletedController);

router
  .route("/goal/updateGoalsOverdueStatus")
  .get(
    ValidationMiddleWare.validateToken(),
    UpdateGoalsOverdueStatusController
  );

  export default router