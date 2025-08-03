import mongoose from "mongoose";
import { Goal } from "../models/GoalsModel";
import { CustomError } from "../utils/customError";

interface addGoalServiceProps {
  category: "weight" | "diet" | "workout" | "sleep";
  startDate: Date;
  endDate: Date;
  title: string;
  description?: string;
  targetDate: Date;
  status: "pending" | "completed" | "overdue";
  progress: Number;
  userId: string;
}

interface getGoalsServiceProps {
  category?: string;
  status?: string;
  userId: string;
  skip: number;
  limit: number;
}

interface getGoalsCountServiceProps {
  category?: string;
  status?: string;
  userId: string;
}

interface goalUpdatesServiceProps {
  category?: "weight" | "diet" | "workout" | "sleep";
  startDate?: Date;
  title?: string;
  description?: string;
  targetDate?: Date;
  progress?: Number;
}
class GoalServices {
  static async addGoalService({
    category,
    startDate,
    title,
    description,
    targetDate,
    status,
    userId,
    progress,
  }: addGoalServiceProps) {
    const newGoal = await Goal.create({
      category,
      startDate,
      title,
      description,
      targetDate,
      status,
      userId,
      progress,
    });

    return newGoal;
  }

  static async deleteGoalServce(goalId: string) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw new CustomError("Invalid goal ID", 400);
    }
    const result = await Goal.findByIdAndDelete(goalId);

    if (!result) {
      throw new CustomError("Goal not found", 404);
    }

    return true; // returns true if something was deleted
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
      new: true, // return the updated document
      runValidators: true, // validate against schema
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
    const filter: any = { userId };

    if (category) filter.category = category;
    if (status) filter.status = status;

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
    const filter: any = { userId };

    if (category) filter.category = category;
    if (status) filter.status = status;

    const count = await Goal.countDocuments(filter);
    return count;
  }
  static async getOverallProgressService(userId: string) {
    const statusCounts = await Goal.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let completed = 0;
    let pending = 0;
    let overdue = 0;

    for (const status of statusCounts) {
      if (status._id === "completed") completed = status.count;
      if (status._id === "pending") pending = status.count;
      if (status._id === "overdue") overdue = status.count;
    }

    const total = completed + pending + overdue;
    if (total === 0) return { progress: 0 };

    const weightedScore =
      (completed * 1 + pending * 0.5 + overdue * -1) / total;
    const progress = Math.max(
      0,
      Math.min(100, Math.round(weightedScore * 100))
    );

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
        new: true, // return the updated document
        runValidators: true, // validate using schema
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
      userId,
      status: "pending",
      targetDate: { $gte: today }, // targetDate is today or in the future
    }).sort({ targetDate: 1 }); // optional: sort by nearest date first

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
