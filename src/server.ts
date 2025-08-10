import express from "express";
import cors from "cors";
import config from "./config/config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import sleepRoutes from "./routes/sleepRoutes";
import dietRoutes from "./routes/dietRoutes";
import locationRoutes from "./routes/locationRoutes";
import goalsRoutes from "./routes/goalsRoutes";
import cookieParser from "cookie-parser";
const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

config.setupSwagger(app);
app.use("/api", authRoutes);
app.use("/api", goalsRoutes);
app.use("/api", sleepRoutes);
app.use("/api", dietRoutes);
app.use("/api/locations", locationRoutes);
app.use(errorHandler);

config.connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
  });
});

export { app };
