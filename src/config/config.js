"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const dbConfig_1 = __importDefault(require("./dbConfig"));
const swaggerConfig_1 = __importDefault(require("./swaggerConfig"));
dotenv_1.default.config();
const config = {
    port: Number(process.env.PORT) || 3000,
    connectDB: dbConfig_1.default,
    setupSwagger: swaggerConfig_1.default,
};
exports.default = config;
