import express, { Router } from "express";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
import {
  addTrackerController,
  deleteTrackerController,
  updateTrackerController,
  getScheduleController,
} from "../controllers/trackerControllers";
const router: Router = express.Router();

router
  .route("/tracker/getSchedules")
  .get(ValidationMiddleWare.validateToken(), getScheduleController);

router
  .route("/tracker/updateTracking/:trackerId")
  .put(ValidationMiddleWare.validateToken(), updateTrackerController);

router
  .route("/tracker/addTracking/:referencedId")
  .post(ValidationMiddleWare.validateToken(), addTrackerController);

router
  .route("/tracker/deleteTracking/:trackerId")
  .delete(ValidationMiddleWare.validateToken(), deleteTrackerController);
