import mongoose, { Schema, Document } from "mongoose";

export interface IWorkout extends Document {
  type: "weight lifting" | "cardio" | "crossfit" | "yoga";
  exerciseName: string;
  duration: number; // Duration in minutes
  reps: number;
  sets: number;
  userId: mongoose.Types.ObjectId;
  targetMuscleGroup: Array<
    "chest" | "back" | "legs" | "arms" | "shoulders" | "core"
  >;
  goalId?: mongoose.Types.ObjectId;
  workoutDateAndTime: Date;
  createdAt: Date;
  updatedAt: Date;
}





const WorkoutSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["weight lifting", "cardio", "crossfit", "yoga"],
      required: true,
    },
    exerciseName: { type: String, required: true },
    duration: { type: Number }, // Duration in minutes
    reps: { type: Number },
    sets: { type: Number, default: 1 },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    targetMuscleGroup: {
      type: [String],
      enum: ["chest", "back", "legs", "arms", "shoulders", "core"],
      required: true,
    },
    goalId: { type: mongoose.Types.ObjectId, ref: "Goal" },
    workoutDateAndTime: { type: Date, required:true },
  },
  {
    timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
  }
);
WorkoutSchema.index({ userId: 1 });
export const Workout = mongoose.model<IWorkout>("Workout", WorkoutSchema);
