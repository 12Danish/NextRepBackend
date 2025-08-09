import mongoose, { Schema, Document } from "mongoose";

export interface IWorkout extends Document {
  type: "weight lifting" | "cardio" | "cross fit" | "yoga";
  exerciseName: string;
  duration: number; // Duration in minutes
  reps: number;
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
      enum: ["weight lifting", "cardio", "cross fit", "yoga"],
      required: true,
    },
    exerciseName: { type: String, required: true },
    duration: { type: Number }, // Duration in minutes
    reps: { type: Number },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    targetMuscleGroup: {
      type: [String],
      enum: ["chest", "back", "legs", "arms", "shoulders", "core"],
      required: true,
    },
    goalId: { type: mongoose.Types.ObjectId, ref: "Goal" },
    workoutDateAnTime: { type: Date },
  },
  {
    timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
  }
);
WorkoutSchema.index({ userId: 1 });
export const Workout = mongoose.model<IWorkout>("Workout", WorkoutSchema);
