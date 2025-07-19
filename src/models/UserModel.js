"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    username: { type: String },
    authProvider: {
        type: String,
        enum: ["local", "google", "github"],
        required: true,
    },
    firebaseUid: { type: String },
    phone_num: { type: String },
    dob: { type: Date },
    country: { type: String },
    height: { type: Number },
    weight: { type: Number },
}, {
    timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
});
UserSchema.index({ email: 1, authProvider: 1 }, { unique: true });
// Define the toJSON method to exclude the password field
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password; // Remove password from the response
    delete obj.__v; // Remove __v from the response
    return obj;
};
exports.User = mongoose_1.default.model("User", UserSchema);
