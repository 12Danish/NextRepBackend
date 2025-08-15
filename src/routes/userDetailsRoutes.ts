import express, { Router } from "express";
import { updateUserDetailsController, getUserDetailsController } from "../controllers/userDetailsControllers";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/userDetails")
  .get(ValidationMiddleWare.validateToken(), getUserDetailsController);

router
  .route("/userDetails/update")
  .put(ValidationMiddleWare.validateToken(), updateUserDetailsController);

export default router;
