import express, { Router } from "express";
import {
  createSleepController,
  getSleepController,
  updateSleepController,
  deleteSleepController,
} from "../controllers/sleepController";

import { ValidationMiddleWare } from "../middleware/authInputHandler";

import SleepInputHandler from "../middleware/sleepInputHandler";

const router: Router = express.Router();

router
  .route("/sleep/getSleep")
  .get(ValidationMiddleWare.validateToken(), getSleepController);

router
  .route("/sleep/create")
  .post(
    ValidationMiddleWare.validateToken(),
    SleepInputHandler.validateCreateSleepInput(),
    createSleepController
  );

router
  .route("/sleep/update/:sleepId")
  .patch(
    ValidationMiddleWare.validateToken(),
    SleepInputHandler.validateSleepIdParam(),
    SleepInputHandler.validateUpdateSleepInput(),
    SleepInputHandler.validateAtLeastOneUpdateField,
    updateSleepController
  );

router
  .route("/sleep/delete/:sleepId")
  .delete(
    ValidationMiddleWare.validateToken(),
    SleepInputHandler.validateSleepIdParam(),
    deleteSleepController
  );

export default router;
