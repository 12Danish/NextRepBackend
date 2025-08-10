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
  .route("/sleep")
  .post(
    SleepInputHandler.validateCreateSleepInput(),
    createSleepController
  )
  .get(
    SleepInputHandler.validateSleepQueryParams(),
    getSleepController
  );

router
  .route("/sleep/:sleepId")
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
  .route("/sleep/date/:date")
  .get(
    SleepInputHandler.validateDateParam(),
    getSleepByDateController
  );

router
  .route("/sleep/stats/:userId")
  .get(
    SleepInputHandler.validateUserIdParam(),
    getSleepStatsController
  );

router
  .route("/sleep/bulk")
  .post(
    SleepInputHandler.validateMultipleSleepInput(),
    createMultipleSleepController
  );

router
  .route("/sleep/user/:userId")
  .get(
    SleepInputHandler.validateUserIdParam(),
    getAllSleepController
  );

export default router;
