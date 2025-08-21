import express, { Router } from "express";
import { LocationController } from "../controllers/locationController";
import { ValidationMiddleWare } from "../middleware/authInputHandler";

const router: Router = express.Router();

router
  .route("/locations/nearby")
  .get(ValidationMiddleWare.validateToken(), LocationController.findNearbyLocations);

router
  .route("/locations/categories")
  .get(ValidationMiddleWare.validateToken(), LocationController.getLocationCategories);

router
  .route("/locations/cleanup")
  .post(ValidationMiddleWare.validateToken(), LocationController.cleanupCorruptedLocations);

router
  .route("/locations/cleanup-duplicates")
  .post(ValidationMiddleWare.validateToken(), LocationController.cleanupDuplicateLocations);

router
  .route("/locations/health")
  .get(ValidationMiddleWare.validateToken(), LocationController.checkLocationHealth);

export default router;

