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
  changeGoalCompletionStatus,
  updateCurrentWeightController,
} from "../controllers/goalControllers";

import { GoalValidationMiddleware } from "../middleware/goalInputHandler";

import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/goal/add")
  .post(
    ValidationMiddleWare.validateToken(),
    GoalValidationMiddleware.validateAddGoalCategorySpecificDataInput(),
    addGoalController
  );

router
  .route("/goal/delete/:id")
  .delete(
    ValidationMiddleWare.validateToken(),
    GoalValidationMiddleware.validateGoalIdInParams(),
    deleteGoalController
  );

router
  .route("/goal/update/:id")
  .patch(
    ValidationMiddleWare.validateToken(),
    GoalValidationMiddleware.validateGoalIdInParams(),
    GoalValidationMiddleware.validateUpdateGoalInput(),
    updateGoalDetailsController
  );

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
  .route("/goal/changeCompletionStatus/:id")
  .get(
    ValidationMiddleWare.validateToken(),
    GoalValidationMiddleware.validateGoalIdInParams(),
    changeGoalCompletionStatus
  );

router.route("/goal/updateGoalsOverdueStatus").get(
  ValidationMiddleWare.validateToken(),

  UpdateGoalsOverdueStatusController
);

router
  .route("/goal/updateWeight/:id")
  .put(ValidationMiddleWare.validateToken(), updateCurrentWeightController);
export default router;
