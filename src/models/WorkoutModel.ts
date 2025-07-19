import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkout extends Document {
    type: "weight lifting" | "cardio" | "cross fit" | "yoga";
    exerciseName: string;
    duration: number; // Duration in minutes
    userId: mongoose.Types.ObjectId;
    targetMuscleGroup: "chest" | "back" | "legs" | "arms" | "shoulders" | "core";
    status: "completed" | "pending" | "skipped";
    goalId?: mongoose.Types.ObjectId;
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
        duration: { type: Number, required: true }, // Duration in minutes
        userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        targetMuscleGroup: {
            type: String,
            enum: ["chest", "back", "legs", "arms", "shoulders", "core"],
            required: true,
        },
        status: {
            type: String,
            enum: ["completed", "pending", "skipped"],
            default: "pending",
        },
        goalId: { type: mongoose.Types.ObjectId, ref: 'Goal' },
    },
    {
        timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
    }
);
WorkoutSchema.index({ userId: 1, type: 1, exerciseName: 1, createdAt: -1 }, { unique: true });
export const Workout = mongoose.model<IWorkout>('Workout', WorkoutSchema);