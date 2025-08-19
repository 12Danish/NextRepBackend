import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mode = process.env.MODE;
const MONGO_URI =
  mode == "test"
    ? (process.env.TEST_DB_CONN_STR as string)
    : (process.env.DB_CONN_STR as string);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[Database] MongoDB connected");
  } catch (error) {
    console.error("[Error] MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
