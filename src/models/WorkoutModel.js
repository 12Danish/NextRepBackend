"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workout = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const WorkoutSchema = new mongoose_1.default.Schema({
    type: { type: String, enum: ["weight lifting", "cardio", "cross fit", "yoga"], required: true }, 
    exerciseName: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    targetMuscleGroup: { type: String, enum: ["chest", "back", "legs", "arms", "shoulders", "core"], required: true },
    status: { type: String, enum: ["completed", "pending", "skipped"], default: "pending" },
    goalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Goal" },
    caloriesBurnt: { type: Number, required: true }, 
},
{ timestamps: true } // ⏱ Automatically adds `createdAt` and `updatedAt`
);
WorkoutSchema.index({ userId: 1, type: 1, exerciseName: 1, createdAt: -1 }, { unique: true });
exports.Workout = mongoose_1.default.model("Workout", WorkoutSchema);