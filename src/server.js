"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config/config"));
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
config_1.default.setupSwagger(app);
app.use("/api", authRoutes_1.default);
app.use(errorHandler_1.errorHandler);
config_1.default.connectDB().then(() => {
    app.listen(config_1.default.port, () => {
        console.log(`🚀 Server running on http://localhost:${config_1.default.port}`);
    });
});
