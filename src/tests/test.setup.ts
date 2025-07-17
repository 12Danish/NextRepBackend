// jest.setup.ts
import mongoose from "mongoose";
import connectDB from "../config/dbConfig";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  // Drop entire test DB and close connection after all tests
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
