"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sleep = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SleepSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    date: { type: Date, required: true }
},
{
    timestamps: true // ⏱ Automatically adds `createdAt` and `updatedAt`
});
SleepSchema.index({ userId: 1, date: 1 }, { unique: true });

exports.Sleep = mongoose_1.default.model("Sleep", SleepSchema);