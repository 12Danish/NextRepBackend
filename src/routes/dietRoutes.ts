import express, { Router } from "express";
import {
  createDietController,
  getDietsController,
  updateDietController,
  deleteDietController,
  getUserNutritionSummaryController,
  createBulkMealPlanController,
} from "../controllers/dietControllers";

import { DietValidationMiddleware } from "../middleware/dietInputHandler";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/diet/getDiet")
  .get(ValidationMiddleWare.validateToken(), getDietsController);

router
  .route("/diet/createDiet")
  .post(
    ValidationMiddleWare.validateToken(),
    DietValidationMiddleware.validateCreateDietInput(),
    createDietController
  );

router
  .route("/diet/update/:dietId")
  .put(
    ValidationMiddleWare.validateToken(),
    DietValidationMiddleware.validateDietIdParam(),
    DietValidationMiddleware.validateUpdateDietInput(),
    updateDietController
  );

router
  .route("/diet/delete/:dietId")
  .delete(
    ValidationMiddleWare.validateToken(),
    DietValidationMiddleware.validateDietIdParam(),
    deleteDietController
  );

router
  .route("/diet/user/summary")
  .get(ValidationMiddleWare.validateToken(), getUserNutritionSummaryController);

router
  .route("/diet/bulk-meal-plan")
  .post(
    ValidationMiddleWare.validateToken(),
    createBulkMealPlanController
  );

export default router;
