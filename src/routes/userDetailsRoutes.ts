import express, { Router } from "express";
import { updateUserDetailsController, getUserDetailsController, getUserComprehensiveInfoController } from "../controllers/userDetailsControllers";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/userDetails")
  .get(ValidationMiddleWare.validateToken(), getUserDetailsController);

router
  .route("/userDetails/comprehensive")
  .get(ValidationMiddleWare.validateToken(), getUserComprehensiveInfoController);

router
  .route("/userDetails/update")
  .put(ValidationMiddleWare.validateToken(), updateUserDetailsController);

export default router;
