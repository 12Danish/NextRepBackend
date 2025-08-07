import mongoose, { Schema, Document } from "mongoose";

// Base interface for common goal fields
interface IBaseGoal extends Document {
  category: "weight" | "diet" | "workout" | "sleep";
  userId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  targetDate: Date;
  status: "pending" | "completed" | "overdue";
  createdAt: Date;
  updatedAt: Date;
  data: any; // Temporarily use any; will be refined in IGoal
  description?: string;
}

// Category-specific interfaces
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

// Discriminated union for IGoal
interface IWeightGoal extends IBaseGoal {
  category: "weight";
  data: IWeightGoalData;
}

interface IDietGoal extends IBaseGoal {
  category: "diet";
  data: IDietGoalData;
}

interface ISleepGoal extends IBaseGoal {
  category: "sleep";
  data: ISleepGoalData;
}

interface IWorkoutGoal extends IBaseGoal {
  category: "workout";
  data: IWorkoutGoalData;
}

export type IGoal = IWeightGoal | IDietGoal | ISleepGoal | IWorkoutGoal;

export const GoalSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["weight", "diet", "workout", "sleep"],
      required: true,
    },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    startDate: { type: Date, required: true },
    description: { type: String },
    endDate: { type: Date || null, default: "null" },
    targetDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "overdue"],
      default: "pending",
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Unique index on userId and category
GoalSchema.index({ userId: 1 });
export const Goal = mongoose.model<IGoal>("Goal", GoalSchema);
