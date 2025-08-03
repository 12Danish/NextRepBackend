import express, { Router } from "express";
import {
  createDietController,
  getDietsController,
  getDietByIdController,
  updateDietController,
  deleteDietController,
  getUserDietController,
  getUserNutritionSummaryController,
  getUserTodayDietController,
  getUserDietByDateController,
  searchDietsController,
} from "../controllers/dietControllers";

import { ValidationMiddleware } from "../middleware/dietInputHandler";

const router: Router = express.Router();

router
  .route("/diet")
  .post(
    ValidationMiddleware.validateCreateDietInput(),
    createDietController
  )
  .get(
    ValidationMiddleware.validateDietFiltersQuery(),
    ValidationMiddleware.validatePaginationQuery(),
    getDietsController
  );

router
  .route("/diet/:dietId")
  .get(
    ValidationMiddleware.validateDietIdParam(),
    getDietByIdController
  )
  .put(
    ValidationMiddleware.validateDietIdParam(),
    ValidationMiddleware.validateUpdateDietInput(),
    updateDietController
  )
  .delete(
    ValidationMiddleware.validateDietIdParam(),
    deleteDietController
  );

router
  .route("/diet/user/:userId")
  .get(
    ValidationMiddleware.validateUserIdParam(),
    ValidationMiddleware.validatePaginationQuery(),
    getUserDietController
  );

router
  .route("/diet/user/:userId/summary")
  .get(
    ValidationMiddleware.validateUserIdParam(),
    ValidationMiddleware.validateDateRangeQuery(),
    getUserNutritionSummaryController
  );

router
  .route("/diet/user/:userId/today")
  .get(
    ValidationMiddleware.validateUserIdParam(),
    ValidationMiddleware.validatePaginationQuery(),
    getUserTodayDietController
  );

router
  .route("/diet/user/:userId/date/:date")
  .get(
    ValidationMiddleware.validateUserIdParam(),
    ValidationMiddleware.validateDateParam(),
    ValidationMiddleware.validatePaginationQuery(),
    getUserDietByDateController
  );

router
  .route("/diet/search/:userId")
  .get(
    ValidationMiddleware.validateUserIdParam(),
    ValidationMiddleware.validateSearchQuery(),
    ValidationMiddleware.validatePaginationQuery(),
    searchDietsController
  );

export default router;