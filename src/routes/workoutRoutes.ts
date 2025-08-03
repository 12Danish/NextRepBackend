import express, { Router } from "express";
import {
  firebaseLoginController,
  customLoginController,
  registerUserController,
  logoutController,
} from "../controllers/userControllers";

import { ValidationMiddleWare } from "../middleware/authInputHandler";
const router: Router = express.Router();


router.route("/workout/create").post(ValidationMiddleWare.validateToken())

router.route("/workout/getSchedule").get(ValidationMiddleWare.validateToken())

router.route("/workout/updateWorkout/:id").post(ValidationMiddleWare.validateToken())

router.route("workout/deleteWorkout/:id").delete(ValidationMiddleWare.validateToken())
