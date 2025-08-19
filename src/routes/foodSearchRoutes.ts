import express from "express";
import { searchFoodController } from "../controllers/foodSearchController";
import { ValidationMiddleWare } from "../middleware/authInputHandler";

const router = express.Router();

// All routes require authentication
router.use(ValidationMiddleWare.validateToken());

// Search for foods
router.get("/food/search", searchFoodController);

export default router;
