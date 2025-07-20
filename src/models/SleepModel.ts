import mongoose, { Schema, Document } from 'mongoose';

export interface ISleep extends Document {
    userId: mongoose.Types.ObjectId;
    duration: number; // Duration in mnutes
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SleepSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        duration: { type: Number, required: true }, 
        date: { type: Date, required: true },
        goalId: { type: mongoose.Types.ObjectId, required: true, ref: 'Goal' }
    },
    {
        timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
    }
);
SleepSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<ISleep>('Sleep', SleepSchema);