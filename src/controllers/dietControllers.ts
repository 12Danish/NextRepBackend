import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import DietServices from "../services/dietService";

/**
 * @desc    Create a new diet entry for the authenticated user
 * @route   POST /api/diet
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @body
 * {
 *   "foodName": "string",              // Required - Name of the food
 *   "meal": "breakfast|lunch|dinner|snack", // Required - Meal type
 *   "calories": number,                 // Required - Total calories
 *   "carbs": number,                    // Required - Carbohydrates in grams
 *   "protein": number,                  // Required - Protein in grams
 *   "fat": number,                      // Required - Fat in grams
 *   "mealDateAndTime": "Date",          // Required - Date and time of the meal
 *   "mealWeight": number,               // Optional - Weight of the meal in grams
 *   "goalId": "string"                   // Optional - Related goal ID
 * }
 *
 * @returns
 * {
 *   "message": "Diet entry created successfully",
 *   "data": { ...newDiet }
 * }
 *
 * @errors
 * - 400 if required fields are missing or invalid
 * - 409 if entry already exists for given meal and foodName
 * - 500 in case of unexpected error
 */
const createDietController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const dietData = { ...req.body, userId };

    const newDiet = await DietServices.createDietService(dietData);

    res.status(200).json({
      message: "Diet entry created successfully",
      data: newDiet,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get diet entries for the authenticated user with optional filters and pagination
 * @route   GET /api/diet
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @query
 * viewType (string)  - "day", "week", or "month" (default "day")
 * offset (number)    - Offset from the current period (default 0)
 *
 * @returns
 * {
 *   "message": "Diet entries retrieved successfully",
 *   "data": [ ...dietEntries ]
 * }
 *
 * @errors
 * - 500 in case of unexpected error
 */
const getDietsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const viewType = req.query.viewType ? req.query.viewType : "day";
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const particularDate = req.query.particularDate;

    const diets = await DietServices.getDietsService({
      userId,
      viewType,
      offset,
      particularDate,
    });

    res.status(200).json({
      message: "Diet entries retrieved successfully",
      data: diets,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a diet entry
 * @route   PATCH /api/diet/:dietId
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @params
 * dietId (string) - ID of the diet entry
 *
 * @body
 * {
 *   "fieldToUpdate": "value"
 * }
 *
 * @returns
 * {
 *   "message": "Diet entry updated successfully",
 *   "data": { ...updatedDiet }
 * }
 *
 * @errors
 * - 404 if no entry found with given ID
 * - 500 in case of unexpected error
 */
const updateDietController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dietId } = req.params;
    const updates = req.body;

    const updatedDiet = await DietServices.updateDietService(dietId, updates);

    res.status(200).json({
      message: "Diet entry updated successfully",
      data: updatedDiet,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a diet entry
 * @route   DELETE /api/diet/:dietId
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @params
 * dietId (string) - ID of the diet entry
 *
 * @returns
 * {
 *   "message": "Diet entry deleted successfully"
 * }
 *
 * @errors
 * - 404 if no entry found with given ID
 * - 500 in case of unexpected error
 */
const deleteDietController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dietId } = req.params;

    await DietServices.deleteDietService(dietId);

    res.status(200).json({
      message: "Diet entry deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get nutrition summary for the authenticated user within a date range
 * @route   GET /api/diet/summary
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @query
 * startDate (string) - Required - YYYY-MM-DD
 * endDate (string)   - Required - YYYY-MM-DD
 *
 * @returns
 * {
 *   "message": "Nutrition summary retrieved successfully",
 *   "data": {
 *       "totalCalories": number,
 *       "totalProtein": number,
 *       "totalCarbs": number,
 *       "totalFat": number
 *   }
 * }
 *
 * @errors
 * - 400 if required query params are missing
 * - 500 in case of unexpected error
 */
const getUserNutritionSummaryController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const { startDate, endDate } = req.query;

    const summary = await DietServices.getUserNutritionSummaryService(
      userId,
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      message: "Nutrition summary retrieved successfully",
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create multiple diet entries for a meal plan
 * @route   POST /api/diet/bulk-meal-plan
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @body
 * {
 *   "meals": [
 *     {
 *       "foodName": "string",
 *       "meal": "breakfast|lunch|dinner|snack",
 *       "mealDateAndTime": "Date",
 *       "mealWeight": number,
 *       "goalId": "string"
 *     }
 *   ]
 * }
 *
 * @returns
 * {
 *   "message": "Meal plan created successfully",
 *   "data": [ ...createdMeals ]
 * }
 */
const createBulkMealPlanController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const { meals } = req.body;

    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({
        message: "Meals array is required and must not be empty"
      });
    }

    const createdMeals = await DietServices.createBulkMealPlanService(meals, userId);

    res.status(200).json({
      message: "Meal plan created successfully",
      data: createdMeals,
    });
  } catch (err) {
    next(err);
  }
};

export {
  createDietController,
  getDietsController,
  updateDietController,
  deleteDietController,
  getUserNutritionSummaryController,
  createBulkMealPlanController,
};
