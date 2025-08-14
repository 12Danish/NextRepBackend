import express, { Router } from "express";
import { updateUserDetailsController } from "../controllers/userDetailsControllers";
import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/userDetails/update")
  .put(ValidationMiddleWare.validateToken(), updateUserDetailsController);

export default router;
