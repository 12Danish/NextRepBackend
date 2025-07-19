"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diet = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DietSchema = new mongoose_1.default.Schema({
    foodName: { type: String, required: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    meal: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    status: { type: String, enum: ["taken", "next", "overdue", "skipped"], default: "next" },
    goalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Goal" },
}, {
    timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
});
DietSchema.index({ userId: 1, meal: 1, foodName: 1 }, { unique: true });

export const Diet = mongoose_1.default.model("Diet", DietSchema);

