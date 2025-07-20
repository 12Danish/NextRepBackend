"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sleepController_1 = require("../controllers/sleepController");
const sleepInputHandler_1 = require("../middleware/sleepInputHandler");
const router = express_1.default.Router();

router
    .route("/")
    .post(sleepInputHandler_1.SleepInputHandler.validateCreateSleepInput(), sleepController_1.createSleepController)
    .get(sleepInputHandler_1.SleepInputHandler.validateSleepQueryParams(), sleepController_1.getSleepController);

router
    .route("/:sleepId")
    .get(sleepInputHandler_1.SleepInputHandler.validateSleepIdParam(), sleepController_1.getSleepByIdController)
    .put(sleepInputHandler_1.SleepInputHandler.validateSleepIdParam(), sleepInputHandler_1.SleepInputHandler.validateUpdateSleepInput(), sleepInputHandler_1.SleepInputHandler.validateAtLeastOneUpdateField, sleepController_1.updateSleepController)
    .delete(sleepInputHandler_1.SleepInputHandler.validateSleepIdParam(), sleepController_1.deleteSleepController);

router
    .route("/date/:date")
    .get(sleepInputHandler_1.SleepInputHandler.validateDateParam(), sleepController_1.getSleepByDateController);

router
    .route("/stats/:userId")
    .get(sleepInputHandler_1.SleepInputHandler.validateUserIdParam(), sleepController_1.getSleepStatsController);

router
    .route("/bulk")
    .post(sleepInputHandler_1.SleepInputHandler.validateMultipleSleepInput(), sleepController_1.createMultipleSleepController);

router
    .route("/user/:userId")
    .get(sleepInputHandler_1.SleepInputHandler.validateUserIdParam(), sleepController_1.getAllSleepController);

exports.default = router;
