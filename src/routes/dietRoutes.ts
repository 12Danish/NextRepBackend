import express, { Router } from "express";
import {
  createDietController,
  getDietsController,
  updateDietController,
  deleteDietController,
  getUserNutritionSummaryController,
} from "../controllers/dietControllers";

import { DietValidationMiddleware } from "../middleware/dietInputHandler";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router.route("/diet/getDiet").get(getDietsController);

router
  .route("/diet/createDiet")
  .post(
    ValidationMiddleWare.validateToken(),
    DietValidationMiddleware.validateCreateDietInput(),
    createDietController
  );

router
  .route("/diet/:dietId")
  .put(
    ValidationMiddleWare.validateToken(),
    DietValidationMiddleware.validateDietIdParam(),
    DietValidationMiddleware.validateUpdateDietInput(),
    updateDietController
  )
  .delete(
    ValidationMiddleWare.validateToken(),
    DietValidationMiddleware.validateDietIdParam(),
    deleteDietController
  );

router
  .route("/diet/user/:userId/summary")
  .get(getUserNutritionSummaryController);

export default router;
