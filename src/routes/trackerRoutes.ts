import express, { Router } from "express";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
import {
  addTrackerController,
  deleteTrackerController,
  updateTrackerController,
  getTrackedController,
} from "../controllers/trackerControllers";

import TrackerValidationMiddleware from "../middleware/trackerMiddleware";
const router: Router = express.Router();

router
  .route("/tracker/getTracked")
  .get(ValidationMiddleWare.validateToken(), getTrackedController);

router
  .route("/tracker/updateTracking/:trackerId")
  .put(
    ValidationMiddleWare.validateToken(),
    TrackerValidationMiddleware.validateTrackerIdOrReferenceIdInParam(),
    updateTrackerController
  );

router
  .route("/tracker/addTracking/:referenceId")
  .post(
    ValidationMiddleWare.validateToken(),
    TrackerValidationMiddleware.validateTrackerIdOrReferenceIdInParam(),
    TrackerValidationMiddleware.validateAddTrackerInput(),
    addTrackerController
  );

router
  .route("/tracker/deleteTracking/:trackerId")
  .delete(
    ValidationMiddleWare.validateToken(),
    TrackerValidationMiddleware.validateTrackerIdOrReferenceIdInParam(),
    deleteTrackerController
  );
