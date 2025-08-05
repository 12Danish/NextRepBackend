import mongoose from "mongoose";
import { Goal } from "../models/GoalsModel";
import { CustomError } from "../utils/customError";

// Interface for category-specific data
interface IWeightGoalData {
  goalType: "gain" | "loss" | "maintenance";
  targetWeight: number;
  currentWeight: number;
  previousWeights: { weight: number; date: Date }[];
}

interface IDietGoalData {
  targetCalories: number;
  targetProteins: number;
  targetFats: number;
  targetCarbs: number;
}

interface ISleepGoalData {
  targetHours: number;
}

interface IWorkoutGoalData {
  targetMinutes?: number;
  targetReps?: number;
  exerciseName: string;
}

// Interface for adding a goal
interface addGoalServiceProps {
  category: "weight" | "diet" | "workout" | "sleep";
  startDate: Date;
  endDate: Date;
  targetDate: Date;
  status: "pending" | "completed" | "overdue";
  userId: string;
  description: string;
  data: IWeightGoalData | IDietGoalData | ISleepGoalData | IWorkoutGoalData;
}

// Interface for fetching goals
interface getGoalsServiceProps {
  category?: string;
  status?: string;
  userId: string;
  skip: number;
  limit: number;
}

// Interface for counting goals
interface getGoalsCountServiceProps {
  category?: string;
  status?: string;
  userId: string;
}

// Interface for updating goal details
interface goalUpdatesServiceProps {
  category?: "weight" | "diet" | "workout" | "sleep";
  startDate?: Date;
  endDate?: Date;
  targetDate?: Date;
  status?: "pending" | "completed" | "overdue";
  data?: IWeightGoalData | IDietGoalData | ISleepGoalData | IWorkoutGoalData;
}

class GoalServices {
  static async addGoalService({
    category,
    startDate,
    endDate,
    targetDate,
    status,
    userId,
    data,
  }: addGoalServiceProps) {
    const newGoal = await Goal.create({
      category,
      startDate,
      endDate,
      targetDate,
      status,
      userId: new mongoose.Types.ObjectId(userId),
      data,
    });

    return newGoal;
  }

  static async deleteGoalService(goalId: string) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw new CustomError("Invalid goal ID", 400);
    }
    const result = await Goal.findByIdAndDelete(goalId);

    if (!result) {
      throw new CustomError("Goal not found", 404);
    }

    return true;
  }

  static async updateGoalDetailsService({
    goalId,
    updates,
  }: {
    goalId: string;
    updates: goalUpdatesServiceProps;
  }) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw new CustomError("Invalid goal ID", 400);
    }

    const updatedGoal = await Goal.findByIdAndUpdate(goalId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedGoal) {
      throw new CustomError("Goal not found", 404);
    }

    return updatedGoal;
  }

  static async getGoalsService({
    category,
    status,
    skip,
    limit,
    userId,
  }: getGoalsServiceProps) {
    const filter: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (category) filter.category = category;
    if (status) filter.status = status;

    console.log("Goal Services");
    console.log(`skip : ${skip}`);
    console.log(`limit : ${limit}`);
    console.log(`status : ${status}`);
    console.log(`category : ${category}`);
    console.log("filter :", JSON.stringify(filter, null, 2));

    const goals = await Goal.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return goals;
  }

  static async getGoalsCountService({
    category,
    status,
    userId,
  }: getGoalsCountServiceProps) {
    const filter: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (category) filter.category = category;
    if (status) filter.status = status;

    const count = await Goal.countDocuments(filter);
    return count;
  }

  static async getOverallProgressService(userId: string) {
    const goals = await Goal.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    console.log("Progress Service");

    let completed = 0;
    let pending = 0;
    let overdue = 0;
    let totalProgress = 0;

    for (const goal of goals) {
      let goalProgress = 0;

      if (goal.status === "completed") {
        completed++;
        goalProgress = 100;
      } else if (goal.status === "pending") {
        pending++;
        // Calculate progress based on category
        if (goal.category === "weight") {
          const data = goal.data as IWeightGoalData;
          const weightChange = Math.abs(data.currentWeight - data.targetWeight);
          const initialChange = Math.abs(
            data.previousWeights[0]?.weight ||
              data.currentWeight - data.targetWeight
          );
          goalProgress = initialChange
            ? (weightChange / initialChange) * 100
            : 0;
        } else if (goal.category === "diet") {
          // Assume progress based on external tracking (e.g., logged calories); placeholder
          goalProgress = 50; // Simplified for example
        } else if (goal.category === "sleep") {
          // Assume progress based on external tracking; placeholder
          goalProgress = 50;
        } else if (goal.category === "workout") {
          // Assume progress based on external tracking; placeholder
          goalProgress = 50;
        }
      } else if (goal.status === "overdue") {
        overdue++;
        goalProgress = 0;
      }

      totalProgress += goalProgress;
    }

    const total = completed + pending + overdue;
    const progress = total ? Math.round(totalProgress / total) : 0;

    return { progress, completed, pending, overdue, total };
  }

  static async markGoalAsCompleteService(goalId: string) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw new CustomError("Invalid goal ID", 400);
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      {
        status: "completed",
        endDate: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedGoal) {
      throw new CustomError("Goal not found or could not be updated", 404);
    }

    return updatedGoal;
  }

  static async getUpcomingGoalsService(userId: string) {
    const today = new Date();

    const upcomingGoals = await Goal.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: "pending",
      targetDate: { $gte: today },
    }).sort({ targetDate: 1 });

    return upcomingGoals;
  }

  static async updateGoalStatusService(userId: string) {
    const today = new Date();

    const result = await Goal.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        status: "pending",
        targetDate: { $lt: today },
      },
      {
        $set: { status: "overdue" },
      }
    );

    return result;
  }
}

export default GoalServices;
