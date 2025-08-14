import { Diet, IDiet } from "../models/DietModel";
import { CustomError } from "../utils/customError";
import mongoose from "mongoose";
import CommonUtlis from "./commonUtils";

interface DietInput {
  foodName: string;
  userId: string;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  mealDateAndTime: Date;
  mealWeight?: number;
  goalId?: string;
}

class DietServices {
  /**
   * Creates a new diet entry for a user
   */
  static async createDietService(dietInput: DietInput): Promise<IDiet> {
    const {
      foodName,
      userId,
      meal,
      calories,
      carbs,
      protein,
      fat,
      goalId,
      mealDateAndTime,
      mealWeight,
    } = dietInput;

    const existingDiet = await Diet.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      meal,
      foodName: foodName.trim(),
    });

    if (existingDiet) {
      throw new CustomError(
        "Diet entry already exists for this meal and food",
        409
      );
    }

    const newDiet = await Diet.create({
      foodName: foodName.trim(),
      userId: new mongoose.Types.ObjectId(userId),
      meal,
      calories,
      carbs,
      protein,
      fat,
      mealDateAndTime,
      mealWeight,
      goalId: goalId ? new mongoose.Types.ObjectId(goalId) : undefined,
    });

    return newDiet;
  }

  static async getDietsService({
    userId,
    viewType,
    offset,
    particularDate,
  }: {
    userId: string;
    viewType: "day" | "week" | "month";
    offset: number;
    particularDate?: Date;
  }) {
    // Calculate the date range
    const { start, end } = CommonUtlis.calculate_start_and_end_dates(
      viewType,
      offset,
      particularDate ? new Date(particularDate) : undefined
    );

    // Get diets in the given range
    const diets = await Diet.find({
      userId: new mongoose.Types.ObjectId(userId),
      mealDateAndTime: { $gte: start, $lte: end },
    }).sort({ mealDateAndTime: 1 });

    // Check if there are previous diet entries before this range
    const hasPrev = await Diet.exists({
      userId: new mongoose.Types.ObjectId(userId),
      mealDateAndTime: { $lt: start },
    });

    // Check if there are next diet entries after this range
    const hasNext = await Diet.exists({
      userId: new mongoose.Types.ObjectId(userId),
      mealDateAndTime: { $gt: end },
    });

    return {
      start,
      end,
      count: diets.length,
      diets,
      prev: Boolean(hasPrev),
      next: Boolean(hasNext),
    };
  }

  /**
   * Updates a specific diet entry by its ID
   */
  static async updateDietService(
    dietId: string,
    updates: Partial<DietInput>
  ): Promise<IDiet> {
    if (!updates || Object.keys(updates).length === 0) {
      throw new CustomError("No updates provided", 400);
    }

    if (updates.foodName) {
      updates.foodName = updates.foodName.trim();
    }

    if (updates.goalId) {
      updates.goalId = updates.goalId ? updates.goalId : undefined;
    }

    const diet = await Diet.findByIdAndUpdate(dietId, updates, {
      new: true,
      runValidators: true,
    });
    if (!diet) {
      throw new CustomError("Diet entry not found", 404);
    }
    return diet;
  }

  /**
   * Deletes a specific diet entry by its ID
   */
  static async deleteDietService(dietId: string): Promise<IDiet> {
    const diet = await Diet.findByIdAndDelete(dietId);
    if (!diet) {
      throw new CustomError("Diet entry not found", 404);
    }
    return diet;
  }

  /**
   * Retrieves nutrition summary for a user
   */
  static async getUserNutritionSummaryService(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (startDate || endDate) {
      query.mealDateAndTime = {};
      if (startDate) query.mealDateAndTime.$gte = new Date(startDate);
      if (endDate) query.mealDateAndTime.$lte = new Date(endDate);
    }

    const result = await Diet.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          calories: { $sum: "$calories" },
          carbs: { $sum: "$carbs" },
          protein: { $sum: "$protein" },
          fat: { $sum: "$fat" },
        },
      },
    ]);

    if (!result.length) {
      return { calories: 0, carbs: 0, protein: 0, fat: 0 };
    }

    return result[0];
  }
}

export default DietServices;
