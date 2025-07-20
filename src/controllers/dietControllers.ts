import { Request, Response, NextFunction } from "express";
import DietServices from "../services/dietService";
import { CustomError } from "../utils/customError";

// Async error handler wrapper
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
const asyncHandler = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create new diet entry
export const createDietController = asyncHandler(async (req: Request, res: Response) => {
  const dietData = req.body;
  
  const newDiet = await DietServices.createDietService(dietData);
  
  res.status(201).json({
    success: true,
    message: "Diet entry created successfully",
    data: newDiet
  });
});

// Get diets with filters and pagination
export const getDietsController = asyncHandler(async (req: Request, res: Response) => {
  const { userId, meal, status, startDate, endDate } = req.query;
  const { page, limit, sortBy, sortOrder } = req.query;

  const filters = {
    ...(userId && { userId: userId as string }),
    ...(meal && { meal: meal as "breakfast" | "lunch" | "dinner" | "snack" }),
    ...(status && { status: status as "taken" | "next" | "overdue" | "skipped" }),
    ...(startDate && { startDate: startDate as string }),
    ...(endDate && { endDate: endDate as string })
  };

  const options = {
    ...(page && { page: parseInt(page as string) }),
    ...(limit && { limit: parseInt(limit as string) }),
    ...(sortBy && { sortBy: sortBy as "createdAt" | "updatedAt" | "calories" | "foodName" }),
    ...(sortOrder && { sortOrder: sortOrder as "asc" | "desc" })
  };

  const result = await DietServices.getDietsService(filters, options);
  
  res.status(200).json({
    success: true,
    message: "Diet entries retrieved successfully",
    data: result.diets,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  });
});

// Get specific diet entry by ID
export const getDietByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { dietId } = req.params;
  
  const diet = await DietServices.getDietByIdService(dietId);
  
  res.status(200).json({
    success: true,
    message: "Diet entry retrieved successfully",
    data: diet
  });
});

// Update diet entry
export const updateDietController = asyncHandler(async (req: Request, res: Response) => {
  const { dietId } = req.params;
  const updates = req.body;
  
  const updatedDiet = await DietServices.updateDietService(dietId, updates);
  
  res.status(200).json({
    success: true,
    message: "Diet entry updated successfully",
    data: updatedDiet
  });
});

// Delete diet entry
export const deleteDietController = asyncHandler(async (req: Request, res: Response) => {
  const { dietId } = req.params;
  
  const deletedDiet = await DietServices.deleteDietService(dietId);
  
  res.status(200).json({
    success: true,
    message: "Diet entry deleted successfully",
    data: deletedDiet
  });
});

// Get all diet entries for a specific user
export const getUserDietController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page, limit, sortBy, sortOrder } = req.query;

  const options = {
    ...(page && { page: parseInt(page as string) }),
    ...(limit && { limit: parseInt(limit as string) }),
    ...(sortBy && { sortBy: sortBy as "createdAt" | "updatedAt" | "calories" | "foodName" }),
    ...(sortOrder && { sortOrder: sortOrder as "asc" | "desc" })
  };

  const result = await DietServices.getUserDietService(userId, options);
  
  res.status(200).json({
    success: true,
    message: "User diet entries retrieved successfully",
    data: result.diets,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  });
});

// Get user nutrition summary
export const getUserNutritionSummaryController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;
  
  const summary = await DietServices.getUserNutritionSummaryService(
    userId,
    startDate as string,
    endDate as string
  );
  
  res.status(200).json({
    success: true,
    message: "Nutrition summary retrieved successfully",
    data: summary
  });
});

// Get today's diet entries for a user
export const getUserTodayDietController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page, limit, sortBy, sortOrder } = req.query;

  const options = {
    ...(page && { page: parseInt(page as string) }),
    ...(limit && { limit: parseInt(limit as string) }),
    ...(sortBy && { sortBy: sortBy as "createdAt" | "updatedAt" | "calories" | "foodName" }),
    ...(sortOrder && { sortOrder: sortOrder as "asc" | "desc" })
  };

  const result = await DietServices.getUserTodayDietService(userId, options);
  
  res.status(200).json({
    success: true,
    message: "Today's diet entries retrieved successfully",
    data: result.diets,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  });
});

// Get diet entries for specific date
export const getUserDietByDateController = asyncHandler(async (req: Request, res: Response) => {
  const { userId, date } = req.params;
  const { page, limit, sortBy, sortOrder } = req.query;

  const options = {
    ...(page && { page: parseInt(page as string) }),
    ...(limit && { limit: parseInt(limit as string) }),
    ...(sortBy && { sortBy: sortBy as "createdAt" | "updatedAt" | "calories" | "foodName" }),
    ...(sortOrder && { sortOrder: sortOrder as "asc" | "desc" })
  };

  const result = await DietServices.getUserDietByDateService(userId, date, options);
  
  res.status(200).json({
    success: true,
    message: `Diet entries for ${date} retrieved successfully`,
    data: result.diets,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  });
});

// Search diet entries
export const searchDietsController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { q: searchQuery } = req.query;
  const { page, limit, sortBy, sortOrder } = req.query;

  const options = {
    ...(page && { page: parseInt(page as string) }),
    ...(limit && { limit: parseInt(limit as string) }),
    ...(sortBy && { sortBy: sortBy as "createdAt" | "updatedAt" | "calories" | "foodName" }),
    ...(sortOrder && { sortOrder: sortOrder as "asc" | "desc" })
  };

  const result = await DietServices.searchDietsService(
    searchQuery as string,
    userId,
    options
  );
  
  res.status(200).json({
    success: true,
    message: "Diet search completed successfully",
    data: result.diets,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  });
});