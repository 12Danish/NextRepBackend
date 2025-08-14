import express from "express";
import config from "./config/config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import sleepRoutes from "./routes/sleepRoutes";
import dietRoutes from "./routes/dietRoutes";
import goalsRoutes from "./routes/goalsRoutes";
import cookieParser from "cookie-parser";
import workoutRoutes from "./routes/workoutRoutes";
import trackerRoutes from "./routes/trackerRoutes";
import userDetailsRoutes from "./routes/userDetailsRoutes";
import locationRoutes from "./routes/locationRoutes";
import progressRoutes from "./routes/progressRoutes";
const app = express();

app.use(express.json());
app.use(cookieParser());

config.setupSwagger(app);
app.use("/api", authRoutes);
app.use("/api", goalsRoutes);
app.use("/api", sleepRoutes);
app.use("/api", dietRoutes);
app.use("/api", workoutRoutes);
app.use("/api", trackerRoutes);
app.use("/api", userDetailsRoutes);
app.use("/api", progressRoutes);
app.use("/api", locationRoutes);
app.use(errorHandler);

config.connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
  });
});

export { app };
