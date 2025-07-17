import dotenv from "dotenv";
import connectDB from "./dbConfig";
import setupSwagger from "./swaggerConfig";

import { Express } from "express";
dotenv.config();

interface Config {
  port: number;
  connectDB: () => Promise<void>;
  setupSwagger: (app: Express) => void;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  connectDB,
  setupSwagger,
};

export default config;
