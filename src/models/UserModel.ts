import mongoose, { Schema, Document } from "mongoose";

/* The user model supports both firebase  */
export interface IUser extends Document {
  username?: string;
  password?: string;
  email: string;
  authProvider: "local" | "google" | "github";
  firebaseUid?: string;
  createdAt: Date;
  updatedAt: Date;
  phone_num: string;
  dob: Date;
  country: string;
  height: number;
  weight: number;
}


const UserSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true, // ⏱ Automatically adds `createdAt` and `updatedAt`
  }
);

UserSchema.index({ email: 1, authProvider: 1 }, { unique: true });

// Define the toJSON method to exclude the password field
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // Remove password from the response
  delete obj.__v; // Remove __v from the response
  return obj;
};

export const User = mongoose.model("User", UserSchema);
