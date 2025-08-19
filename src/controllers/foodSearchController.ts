import { NextFunction, Request, Response } from "express";
import FoodService from "../services/foodService";

/**
 * @desc    Search for foods using Spoonacular API
 * @route   GET /api/food/search
 * @access  Private
 *
 * @query
 * q (string) - Required - Search query for food
 * number (number) - Optional - Number of results (default 10, max 25)
 *
 * @returns
 * {
 *   "message": "Food search completed successfully",
 *   "data": [ ...foodResults ]
 * }
 */
const searchFoodController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, number = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        message: "Search query 'q' is required"
      });
    }

    const searchResults = await FoodService.searchFood(q, Number(number));

    res.status(200).json({
      message: "Food search completed successfully",
      data: searchResults,
    });
  } catch (err) {
    next(err);
  }
};

export {
  searchFoodController,
};
