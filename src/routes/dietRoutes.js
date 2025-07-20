"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dietControllers_1 = require("../controllers/dietControllers");
const dietInputHandler_1 = require("../middleware/dietInputHandler");
const router = express_1.default.Router();
router
    .route("/")
    .post(dietInputHandler_1.ValidationMiddleware.validateCreateDietInput(), dietControllers_1.createDietController)
    .get(dietInputHandler_1.ValidationMiddleware.validateDietFiltersQuery(), dietInputHandler_1.ValidationMiddleware.validatePaginationQuery(), dietControllers_1.getDietsController);
router
    .route("/:dietId")
    .get(dietInputHandler_1.ValidationMiddleware.validateDietIdParam(), dietControllers_1.getDietByIdController)
    .put(dietInputHandler_1.ValidationMiddleware.validateDietIdParam(), dietInputHandler_1.ValidationMiddleware.validateUpdateDietInput(), dietControllers_1.updateDietController)
    .delete(dietInputHandler_1.ValidationMiddleware.validateDietIdParam(), dietControllers_1.deleteDietController);
router
    .route("/user/:userId")
    .get(dietInputHandler_1.ValidationMiddleware.validateUserIdParam(), dietInputHandler_1.ValidationMiddleware.validatePaginationQuery(), dietControllers_1.getUserDietController);
router
    .route("/user/:userId/summary")
    .get(dietInputHandler_1.ValidationMiddleware.validateUserIdParam(), dietInputHandler_1.ValidationMiddleware.validateDateRangeQuery(), dietControllers_1.getUserNutritionSummaryController);
router
    .route("/user/:userId/today")
    .get(dietInputHandler_1.ValidationMiddleware.validateUserIdParam(), dietInputHandler_1.ValidationMiddleware.validatePaginationQuery(), dietControllers_1.getUserTodayDietController);
router
    .route("/user/:userId/date/:date")
    .get(dietInputHandler_1.ValidationMiddleware.validateUserIdParam(), dietInputHandler_1.ValidationMiddleware.validateDateParam(), dietInputHandler_1.ValidationMiddleware.validatePaginationQuery(), dietControllers_1.getUserDietByDateController);
router
    .route("/search/:userId")
    .get(dietInputHandler_1.ValidationMiddleware.validateUserIdParam(), dietInputHandler_1.ValidationMiddleware.validateSearchQuery(), dietInputHandler_1.ValidationMiddleware.validatePaginationQuery(), dietControllers_1.searchDietsController);
exports.default = router; 