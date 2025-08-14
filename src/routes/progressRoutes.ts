import express, { Router } from "express";

const router: Router = express.Router();

router.route("/progress/getGoalProgress");

router.route("/progress/getScheduleAndTrackerProgress");
