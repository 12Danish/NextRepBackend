import mongoose, { Schema, Document } from "mongoose";

export interface ISleep extends Document {
  userId: mongoose.Types.ObjectId;
  goalId?: mongoose.Types.ObjectId;
  duration: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SleepSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
    goalId: { type: mongoose.Types.ObjectId, ref: "Goal", required: false }, // Make goalId optional
  },
  {
    timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
  }
);

export default mongoose.model<ISleep>("Sleep", SleepSchema);
