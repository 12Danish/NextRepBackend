"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GoalSchema = new mongoose_1.default.Schema({
    category: {type: String, enum: ["weight", "diet", "sleep", "workout"],required: true},
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    title: { type: String, required: true },
    description: { type: String },
    targetDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "completed", "overdue"], default: "pending" },
    progress: { type: Number, default: 0 },
},
{ timeStamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
});
GoalSchema.index({ userId: 1, category: 1, startDate: 1 }, { unique: true });
exports.Goal = mongoose_1.default.model("Goal", GoalSchema);