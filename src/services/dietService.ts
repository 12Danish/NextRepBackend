import { Diet, IDiet } from "../models/DietModel";
import { CustomError } from "../utils/customError";
import mongoose from "mongoose";

interface DietInput {
  foodName: string;
  userId: string;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  carbs: number;    
  protein: number;
  fat: number;
  status?: "taken" | "next" | "overdue" | "skipped";
  goalId?: string;
}

interface DietFilters {
  userId?: string;
  meal?: "breakfast" | "lunch" | "dinner" | "snack";
  status?: "taken" | "next" | "overdue" | "skipped";
  startDate?: string;
  endDate?: string;
}

interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "calories" | "foodName";
  sortOrder?: "asc" | "desc";
}

interface NutritionSummary {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  entryCount: number;
}

class DietServices {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 100;
  private static readonly DEFAULT_SORT_BY = "createdAt";
  private static readonly DEFAULT_SORT_ORDER = "desc";

  /**
   * Validates ObjectId format
   */
  private static isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  /**
   * Validates nutritional values
   */
  private static validateNutrition(calories: number, carbs: number, protein: number, fat: number): void {
    if (calories < 0 || carbs < 0 || protein < 0 || fat < 0) {
      throw new CustomError("Nutritional values must be non-negative", 400);
    }
    if (calories > 10000 || carbs > 1000 || protein > 1000 || fat > 1000) {
      throw new CustomError("Nutritional values exceed reasonable limits", 400);
    }
  }

  /**
   * Validates and sanitizes pagination options
   */
  private static sanitizeOptions(options: QueryOptions): Required<QueryOptions> {
    const page = Math.max(1, options.page || this.DEFAULT_PAGE);
    const limit = Math.min(this.MAX_LIMIT, Math.max(1, options.limit || this.DEFAULT_LIMIT));
    const sortBy = options.sortBy || this.DEFAULT_SORT_BY;
    const sortOrder = options.sortOrder || this.DEFAULT_SORT_ORDER;

    return { page, limit, sortBy, sortOrder };
  }

  /**
   * Creates a new diet entry for a user
   */
  static async createDietService(dietInput: DietInput): Promise<IDiet> {
    const { foodName, userId, meal, calories, carbs, protein, fat, status = "next", goalId } = dietInput;

    // Validate required fields
    if (!foodName?.trim()) {
      throw new CustomError("Food name is required", 400);
    }
    if (!userId?.trim()) {
      throw new CustomError("User ID is required", 400);
    }
    if (!this.isValidObjectId(userId)) {
      throw new CustomError("Invalid user ID format", 400);
    }
    if (goalId && !this.isValidObjectId(goalId)) {
      throw new CustomError("Invalid goal ID format", 400);
    }

    // Validate nutritional values
    this.validateNutrition(calories, carbs, protein, fat);

    try {
      // Check for existing entry (considering the unique index)
      const existingDiet = await Diet.findOne({ 
        userId: new mongoose.Types.ObjectId(userId), 
        meal, 
        foodName: foodName.trim() 
      });

      if (existingDiet) {
        throw new CustomError("Diet entry already exists for this meal and food", 409);
      }

      // Create new diet entry
      const newDiet = await Diet.create({
        foodName: foodName.trim(),
        userId: new mongoose.Types.ObjectId(userId),
        meal,
        calories,
        carbs,
        protein,
        fat,
        status,
        goalId: goalId ? new mongoose.Types.ObjectId(goalId) : undefined
      });

      return newDiet;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      if ((error as any).code === 11000) {
        throw new CustomError("Diet entry already exists for this meal and food", 409);
      }
      throw new CustomError("Failed to create diet entry", 500);
    }
  }

  /**
   * Get diets with flexible filters, pagination, and sorting
   */
  static async getDietsService(
    filters: DietFilters = {},
    options: QueryOptions = {}
  ): Promise<{ diets: IDiet[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: any = {};
    
    // Build query with validation
    if (filters.userId) {
      if (!this.isValidObjectId(filters.userId)) {
        throw new CustomError("Invalid user ID format", 400);
      }
      query.userId = new mongoose.Types.ObjectId(filters.userId);
    }
    if (filters.meal) query.meal = filters.meal;
    if (filters.status) query.status = filters.status;
    
    // Date range validation and handling
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (isNaN(startDate.getTime())) {
          throw new CustomError("Invalid start date format", 400);
        }
        query.createdAt.$gte = startDate;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        if (isNaN(endDate.getTime())) {
          throw new CustomError("Invalid end date format", 400);
        }
        query.createdAt.$lte = endDate;
      }
    }

    const { page, limit, sortBy, sortOrder } = this.sanitizeOptions(options);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    try {
      const [diets, total] = await Promise.all([
        Diet.find(query)
          .sort({ [sortBy]: sortDirection })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Diet.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        diets,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new CustomError("Failed to retrieve diet entries", 500);
    }
  }

  /**
   * Retrieves a specific diet entry by its ID
   */
  static async getDietByIdService(dietId: string): Promise<IDiet> {
    if (!dietId?.trim()) {
      throw new CustomError("Diet ID is required", 400);
    }
    if (!this.isValidObjectId(dietId)) {
      throw new CustomError("Invalid diet ID format", 400);
    }

    try {
      const diet = await Diet.findById(dietId).lean();
      if (!diet) {
        throw new CustomError("Diet entry not found", 404);
      }
      return diet;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Failed to retrieve diet entry", 500);
    }
  }

  /**
   * Updates a specific diet entry by its ID
   */
  static async updateDietService(dietId: string, updates: Partial<DietInput>): Promise<IDiet> {
    if (!dietId?.trim()) {
      throw new CustomError("Diet ID is required", 400);
    }
    if (!this.isValidObjectId(dietId)) {
      throw new CustomError("Invalid diet ID format", 400);
    }
    if (!updates || Object.keys(updates).length === 0) {
      throw new CustomError("No updates provided", 400);
    }

    // Validate updates
    const sanitizedUpdates: any = {};
    
    if (updates.foodName !== undefined) {
      if (!updates.foodName?.trim()) {
        throw new CustomError("Food name cannot be empty", 400);
      }
      sanitizedUpdates.foodName = updates.foodName.trim();
    }
    
    if (updates.userId !== undefined) {
      if (!this.isValidObjectId(updates.userId)) {
        throw new CustomError("Invalid user ID format", 400);
      }
      sanitizedUpdates.userId = new mongoose.Types.ObjectId(updates.userId);
    }
    
    if (updates.goalId !== undefined) {
      if (updates.goalId && !this.isValidObjectId(updates.goalId)) {
        throw new CustomError("Invalid goal ID format", 400);
      }
      sanitizedUpdates.goalId = updates.goalId ? new mongoose.Types.ObjectId(updates.goalId) : null;
    }

    // Copy other valid fields
    ['meal', 'status'].forEach(field => {
      if (updates[field as keyof DietInput] !== undefined) {
        sanitizedUpdates[field] = updates[field as keyof DietInput];
      }
    });

    // Validate nutritional values if provided
    const nutritionFields = ['calories', 'carbs', 'protein', 'fat'] as const;
    const providedNutrition = nutritionFields.filter(field => updates[field] !== undefined);
    
    if (providedNutrition.length > 0) {
      // Get current values for validation
      const currentDiet = await Diet.findById(dietId);
      if (!currentDiet) {
        throw new CustomError("Diet entry not found", 404);
      }
      
      const nutritionToValidate = {
        calories: updates.calories ?? currentDiet.calories,
        carbs: updates.carbs ?? currentDiet.carbs,
        protein: updates.protein ?? currentDiet.protein,
        fat: updates.fat ?? currentDiet.fat
      };
      
      this.validateNutrition(nutritionToValidate.calories, nutritionToValidate.carbs, 
                            nutritionToValidate.protein, nutritionToValidate.fat);
      
      nutritionFields.forEach(field => {
        if (updates[field] !== undefined) {
          sanitizedUpdates[field] = updates[field];
        }
      });
    }

    try {
      const diet = await Diet.findByIdAndUpdate(
        dietId,
        sanitizedUpdates,
        { new: true, runValidators: true }
      );
      
      if (!diet) {
        throw new CustomError("Diet entry not found", 404);
      }
      return diet;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      if ((error as any).code === 11000) {
        throw new CustomError("Diet entry already exists for this meal and food", 409);
      }
      throw new CustomError("Failed to update diet entry", 500);
    }
  }

  /**
   * Deletes a specific diet entry by its ID
   */
  static async deleteDietService(dietId: string): Promise<IDiet> {
    if (!dietId?.trim()) {
      throw new CustomError("Diet ID is required", 400);
    }
    if (!this.isValidObjectId(dietId)) {
      throw new CustomError("Invalid diet ID format", 400);
    }

    try {
      const diet = await Diet.findByIdAndDelete(dietId);
      if (!diet) {
        throw new CustomError("Diet entry not found", 404);
      }
      return diet;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Failed to delete diet entry", 500);
    }
  }

  /**
   * Retrieves all diet entries for a specific user
   */
  static async getUserDietService(
    userId: string,
    options: QueryOptions = {}
  ): Promise<{ diets: IDiet[]; total: number; page: number; limit: number; totalPages: number }> {
    if (!userId?.trim()) {
      throw new CustomError("User ID is required", 400);
    }
    if (!this.isValidObjectId(userId)) {
      throw new CustomError("Invalid user ID format", 400);
    }

    return this.getDietsService({ userId }, options);
  }

  /**
   * Retrieves nutrition summary for a user
   */
  static async getUserNutritionSummaryService(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<NutritionSummary> {
    if (!userId?.trim()) {
      throw new CustomError("User ID is required", 400);
    }
    if (!this.isValidObjectId(userId)) {
      throw new CustomError("Invalid user ID format", 400);
    }

    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    // Add date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          throw new CustomError("Invalid start date format", 400);
        }
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          throw new CustomError("Invalid end date format", 400);
        }
        query.createdAt.$lte = end;
      }
    }

    try {
      const result = await Diet.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            calories: { $sum: "$calories" },
            carbs: { $sum: "$carbs" },
            protein: { $sum: "$protein" },
            fat: { $sum: "$fat" },
            entryCount: { $sum: 1 }
          }
        }
      ]);

      if (!result || result.length === 0) {
        throw new CustomError("No diet entries found for this user", 404);
      }

      const summary = result[0];
      return {
        calories: Math.round(summary.calories * 100) / 100,
        carbs: Math.round(summary.carbs * 100) / 100,
        protein: Math.round(summary.protein * 100) / 100,
        fat: Math.round(summary.fat * 100) / 100,
        entryCount: summary.entryCount
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError("Failed to calculate nutrition summary", 500);
    }
  }

  /**
   * Retrieves diet entries for a specific date
   */
  static async getUserDietByDateService(
    userId: string,
    date: string,
    options: QueryOptions = {}
  ): Promise<{ diets: IDiet[]; total: number; page: number; limit: number; totalPages: number }> {
    if (!userId?.trim()) {
      throw new CustomError("User ID is required", 400);
    }
    if (!this.isValidObjectId(userId)) {
      throw new CustomError("Invalid user ID format", 400);
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new CustomError("Invalid date format", 400);
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getDietsService({
      userId,
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString()
    }, options);
  }

  /**
   * Retrieves today's diet entries for a user
   */
  static async getUserTodayDietService(
    userId: string,
    options: QueryOptions = {}
  ): Promise<{ diets: IDiet[]; total: number; page: number; limit: number; totalPages: number }> {
    const today = new Date().toISOString().split('T')[0];
    return this.getUserDietByDateService(userId, today, options);
  }

  /**
   * Searches for diet entries based on query string
   */
  static async searchDietsService(
    searchQuery: string,
    userId: string,
    options: QueryOptions = {}
  ): Promise<{ diets: IDiet[]; total: number; page: number; limit: number; totalPages: number }> {
    if (!searchQuery?.trim()) {
      throw new CustomError("Search query is required", 400);
    }
    if (!userId?.trim()) {
      throw new CustomError("User ID is required", 400);
    }
    if (!this.isValidObjectId(userId)) {
      throw new CustomError("Invalid user ID format", 400);
    }

    const { page, limit, sortBy, sortOrder } = this.sanitizeOptions(options);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const query = {
      userId: new mongoose.Types.ObjectId(userId),
      foodName: { $regex: searchQuery.trim(), $options: "i" }
    };

    try {
      const [diets, total] = await Promise.all([
        Diet.find(query)
          .sort({ [sortBy]: sortDirection })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Diet.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        diets,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new CustomError("Failed to search diet entries", 500);
    }
  }
}

export default DietServices;