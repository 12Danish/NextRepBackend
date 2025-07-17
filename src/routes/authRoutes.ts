import express, { Router } from "express";
import {
  firebaseLoginController,
  customLoginController,
  registerUserController,
  logoutController,
} from "../controllers/userControllers";
const router: Router = express.Router();

router.route("/userRegister").post(registerUserController);

router.route("/logout").get(logoutController);

router.route("/customLogin").post(customLoginController);

router.route("/firebaseLogin").post(firebaseLoginController);

export default router;
