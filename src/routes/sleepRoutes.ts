import express, { Router } from "express";
import {
  createSleepController,
  getSleepController,
  getSleepByIdController,
  updateSleepController,
  deleteSleepController,
  getSleepByDateController,
  getSleepStatsController,
  createMultipleSleepController,
  getAllSleepController,
} from "../controllers/sleepController";

import SleepInputHandler from "../middleware/sleepInputHandler";

const router: Router = express.Router();

router
  .route("/")
  .post(
    SleepInputHandler.validateCreateSleepInput(),
    createSleepController
  )
  .get(
    SleepInputHandler.validateSleepQueryParams(),
    getSleepController
  );

router
  .route("/:sleepId")
  .get(
    SleepInputHandler.validateSleepIdParam(),
    getSleepByIdController
  )
  .put(
    SleepInputHandler.validateSleepIdParam(),
    SleepInputHandler.validateUpdateSleepInput(),
    SleepInputHandler.validateAtLeastOneUpdateField,
    updateSleepController
  )
  .delete(
    SleepInputHandler.validateSleepIdParam(),
    deleteSleepController
  );

router
  .route("/date/:date")
  .get(
    SleepInputHandler.validateDateParam(),
    getSleepByDateController
  );

router
  .route("/stats/:userId")
  .get(
    SleepInputHandler.validateUserIdParam(),
    getSleepStatsController
  );

router
  .route("/bulk")
  .post(
    SleepInputHandler.validateMultipleSleepInput(),
    createMultipleSleepController
  );

router
  .route("/user/:userId")
  .get(
    SleepInputHandler.validateUserIdParam(),
    getAllSleepController
  );

export default router;
