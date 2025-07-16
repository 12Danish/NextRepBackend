import express from "express";
import config from "./config/config";
import errHandlerMiddleware from "./middleware/errorHandler";
const app = express();

app.use(express.json());

config.setupSwagger(app);

app.use(errHandlerMiddleware);
config.connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
  });
});
