import express, { Router } from "express";
import {
  firebaseLoginController,
  customLoginController,
  registerUserController,
  logoutController,
} from "../controllers/userControllers";

import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();

router
  .route("/userRegister")
  .post(
    ValidationMiddleWare.validateCustomRegisterInput(),
    registerUserController
  );

router.route("/logout").get(logoutController);

router
  .route("/customLogin")
  .post(
    ValidationMiddleWare.validateCustomRegisterInput(),
    customLoginController
  );

router.route("/firebaseLogin").post(firebaseLoginController);

export default router;
