import mongoose , {Schema, Document} from 'mongoose';

export interface IGoal extends Document {
    category: "weight" | "diet" | "workout" | "sleep";
    userId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    title: string;
    description?: string;
    targetDate: Date;
    status: "pending" | "completed" | "overdue";
    progress: number; // Percentage of goal completion
    createdAt: Date;
    updatedAt: Date;
}

const GoalSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            enum: ["weight", "diet", "workout", "sleep"],
            required: true,
        },
        userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        title: { type: String, required: true },
        description: { type: String },
        targetDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["pending", "completed", "overdue"],
            default: "pending",
        },
        progress: { type: Number, default: 0 }, // Default progress is 0%
    },
    {
        timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
    }
);
GoalSchema.index({ userId: 1, category: 1, startDate: 1 }, { unique: true });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
