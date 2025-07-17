import express from "express";
import config from "./config/config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
const app = express();

app.use(express.json());

config.setupSwagger(app);
app.use("/api", authRoutes);
app.use(errorHandler);

config.connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
  });
});
