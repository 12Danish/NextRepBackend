import mongoose, { Schema, Document } from "mongoose";

export interface IDiet extends Document {
  foodName: string;
  userId: mongoose.Types.ObjectId;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  mealWeight: number;
  mealDateAndTime: Date;
  goalId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DietSchema = new mongoose.Schema(
  {
    foodName: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    meal: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    calories: { type: Number, required: true },
    carbs: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    mealDateAndTime: { type: Date, required: true },
    mealWeight: { typ: Number },
    goalId: { type: mongoose.Types.ObjectId, ref: "Goal" },
  },
  {
    timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
  }
);
DietSchema.index({ userId: 1, meal: 1, foodName: 1 }, { unique: true });

export const Diet = mongoose.model<IDiet>("Diet", DietSchema);
