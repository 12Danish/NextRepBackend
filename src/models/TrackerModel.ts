import mongoose, { Schema, Document } from "mongoose";

export interface ITrackerBase extends Document {
  userId: mongoose.Types.ObjectId;
  type: "sleep" | "diet" | "workout";
  referenceId: mongoose.Types.ObjectId; // Will point to Sleep/Diet/Workout
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IWorkoutTracker extends ITrackerBase {
  completedReps?: number;
  completedTime?: number;
}

interface IDietTracker extends ITrackerBase {
  weightConsumed: number;
}

interface ISleepTracker extends ITrackerBase {
  sleepHours?: number; // Add sleep hours for sleep tracking
}

// Union type for the full Tracker
export type ITracker = IWorkoutTracker | IDietTracker | ISleepTracker;

const TrackerSchema = new Schema<ITracker>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["sleep", "diet", "workout"], required: true },
    referenceId: { type: Schema.Types.ObjectId, required: true },
    date: { type: Date, required: true },
    // Workout-specific
    completedReps: { type: Number, required: false },
    completedTime: { type: Number, required: false },

    // Diet-specific
    weightConsumed: { type: Number, required: false },

    // Sleep-specific
    sleepHours: { type: Number, required: false },
  },
  { timestamps: true }
);


export const Tracker = mongoose.model<ITracker>("Tracker", TrackerSchema);
