"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDietsController = exports.getUserDietByDateController = exports.getUserTodayDietController = exports.getUserNutritionSummaryController = exports.getUserDietController = exports.deleteDietController = exports.updateDietController = exports.getDietByIdController = exports.getDietsController = exports.createDietController = void 0;
const dietService_1 = __importDefault(require("../services/dietService"));
const customError_1 = require("../utils/customError");

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Create new diet entry
 * @route   POST /api/diets
 * @access  Private
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * {
 *   "userId": "string",        // MongoDB ObjectId
 *   "foodName": "string",      // Name of the food item
 *   "meal": "string",          // breakfast | lunch | dinner | snack
 *   "calories": "number",      // Calories (0-10000)
 *   "carbs": "number",         // Carbohydrates in grams (0-1000)
 *   "protein": "number",       // Protein in grams (0-1000)
 *   "fat": "number",           // Fat in grams (0-1000)
 *   "status": "string",        // Optional: taken | next | overdue | skipped
 *   "goalId": "string"         // Optional: MongoDB ObjectId
 * }
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Diet entry created successfully",
 *   "data": { ... }
 * }
 */
const createDietController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dietData = req.body;
    const newDiet = yield dietService_1.default.createDietService(dietData);
    res.status(201).json({
        success: true,
        message: "Diet entry created successfully",
        data: newDiet
    });
}));
exports.createDietController = createDietController;

/**
 * @desc    Get diets with filters and pagination
 * @route   GET /api/diets
 * @access  Private
 *
 * @query
 * userId?: string              // Filter by user ID
 * meal?: string               // Filter by meal type
 * status?: string             // Filter by status
 * startDate?: string          // Filter by start date (ISO)
 * endDate?: string            // Filter by end date (ISO)
 * page?: number               // Page number (default: 1)
 * limit?: number              // Items per page (default: 20, max: 100)
 * sortBy?: string             // Sort field (createdAt | updatedAt | calories | foodName)
 * sortOrder?: string          // Sort order (asc | desc)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Diet entries retrieved successfully",
 *   "data": [...],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 100,
 *     "totalPages": 5
 *   }
 * }
 */
const getDietsController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, meal, status, startDate, endDate } = req.query;
    const { page, limit, sortBy, sortOrder } = req.query;
    const filters = {
        ...(userId && { userId: userId }),
        ...(meal && { meal: meal }),
        ...(status && { status: status }),
        ...(startDate && { startDate: startDate }),
        ...(endDate && { endDate: endDate })
    };
    const options = {
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
        ...(sortBy && { sortBy: sortBy }),
        ...(sortOrder && { sortOrder: sortOrder })
    };
    const result = yield dietService_1.default.getDietsService(filters, options);
    res.status(200).json({
        success: true,
        message: "Diet entries retrieved successfully",
        data: result.diets,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
}));
exports.getDietsController = getDietsController;

/**
 * @desc    Get specific diet entry by ID
 * @route   GET /api/diets/:dietId
 * @access  Private
 *
 * @params
 * dietId: string              // MongoDB ObjectId
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Diet entry retrieved successfully",
 *   "data": { ... }
 * }
 */
const getDietByIdController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dietId } = req.params;
    const diet = yield dietService_1.default.getDietByIdService(dietId);
    res.status(200).json({
        success: true,
        message: "Diet entry retrieved successfully",
        data: diet
    });
}));
exports.getDietByIdController = getDietByIdController;

/**
 * @desc    Update diet entry
 * @route   PUT /api/diets/:dietId
 * @access  Private
 *
 * @params
 * dietId: string              // MongoDB ObjectId
 *
 * @body
 * {
 *   "foodName": "string",     // Optional: Name of the food item
 *   "meal": "string",         // Optional: breakfast | lunch | dinner | snack
 *   "calories": "number",     // Optional: Calories (0-10000)
 *   "carbs": "number",        // Optional: Carbohydrates in grams (0-1000)
 *   "protein": "number",      // Optional: Protein in grams (0-1000)
 *   "fat": "number",          // Optional: Fat in grams (0-1000)
 *   "status": "string",       // Optional: taken | next | overdue | skipped
 *   "goalId": "string"        // Optional: MongoDB ObjectId
 * }
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Diet entry updated successfully",
 *   "data": { ... }
 * }
 */
const updateDietController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dietId } = req.params;
    const updates = req.body;
    const updatedDiet = yield dietService_1.default.updateDietService(dietId, updates);
    res.status(200).json({
        success: true,
        message: "Diet entry updated successfully",
        data: updatedDiet
    });
}));
exports.updateDietController = updateDietController;

/**
 * @desc    Delete diet entry
 * @route   DELETE /api/diets/:dietId
 * @access  Private
 *
 * @params
 * dietId: string              // MongoDB ObjectId
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Diet entry deleted successfully",
 *   "data": { ... }
 * }
 */
const deleteDietController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dietId } = req.params;
    const deletedDiet = yield dietService_1.default.deleteDietService(dietId);
    res.status(200).json({
        success: true,
        message: "Diet entry deleted successfully",
        data: deletedDiet
    });
}));
exports.deleteDietController = deleteDietController;

/**
 * @desc    Get all diet entries for a specific user
 * @route   GET /api/diets/user/:userId
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @query
 * page?: number               // Page number (default: 1)
 * limit?: number              // Items per page (default: 20, max: 100)
 * sortBy?: string             // Sort field (createdAt | updatedAt | calories | foodName)
 * sortOrder?: string          // Sort order (asc | desc)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "User diet entries retrieved successfully",
 *   "data": [...],
 *   "pagination": { ... }
 * }
 */
const getUserDietController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    const options = {
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
        ...(sortBy && { sortBy: sortBy }),
        ...(sortOrder && { sortOrder: sortOrder })
    };
    const result = yield dietService_1.default.getUserDietService(userId, options);
    res.status(200).json({
        success: true,
        message: "User diet entries retrieved successfully",
        data: result.diets,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
}));
exports.getUserDietController = getUserDietController;

/**
 * @desc    Get user nutrition summary
 * @route   GET /api/diets/user/:userId/summary
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @query
 * startDate?: string          // Optional: Start date (ISO)
 * endDate?: string            // Optional: End date (ISO)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Nutrition summary retrieved successfully",
 *   "data": {
 *     "calories": 1500.5,
 *     "carbs": 200.3,
 *     "protein": 75.8,
 *     "fat": 45.2,
 *     "entryCount": 15
 *   }
 * }
 */
const getUserNutritionSummaryController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const summary = yield dietService_1.default.getUserNutritionSummaryService(userId, startDate, endDate);
    res.status(200).json({
        success: true,
        message: "Nutrition summary retrieved successfully",
        data: summary
    });
}));
exports.getUserNutritionSummaryController = getUserNutritionSummaryController;

/**
 * @desc    Get today's diet entries for a user
 * @route   GET /api/diets/user/:userId/today
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @query
 * page?: number               // Page number (default: 1)
 * limit?: number              // Items per page (default: 20, max: 100)
 * sortBy?: string             // Sort field (createdAt | updatedAt | calories | foodName)
 * sortOrder?: string          // Sort order (asc | desc)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Today's diet entries retrieved successfully",
 *   "data": [...],
 *   "pagination": { ... }
 * }
 */
const getUserTodayDietController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    const options = {
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
        ...(sortBy && { sortBy: sortBy }),
        ...(sortOrder && { sortOrder: sortOrder })
    };
    const result = yield dietService_1.default.getUserTodayDietService(userId, options);
    res.status(200).json({
        success: true,
        message: "Today's diet entries retrieved successfully",
        data: result.diets,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
}));
exports.getUserTodayDietController = getUserTodayDietController;

/**
 * @desc    Get diet entries for specific date
 * @route   GET /api/diets/user/:userId/date/:date
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 * date: string                // Date in ISO format (YYYY-MM-DD)
 *
 * @query
 * page?: number               // Page number (default: 1)
 * limit?: number              // Items per page (default: 20, max: 100)
 * sortBy?: string             // Sort field (createdAt | updatedAt | calories | foodName)
 * sortOrder?: string          // Sort order (asc | desc)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Diet entries for 2024-01-15 retrieved successfully",
 *   "data": [...],
 *   "pagination": { ... }
 * }
 */
const getUserDietByDateController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, date } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    const options = {
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
        ...(sortBy && { sortBy: sortBy }),
        ...(sortOrder && { sortOrder: sortOrder })
    };
    const result = yield dietService_1.default.getUserDietByDateService(userId, date, options);
    res.status(200).json({
        success: true,
        message: `Diet entries for ${date} retrieved successfully`,
        data: result.diets,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
}));
exports.getUserDietByDateController = getUserDietByDateController;

/**
 * @desc    Search diet entries
 * @route   GET /api/diets/search/:userId
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @query
 * q: string                   // Search query (required)
 * page?: number               // Page number (default: 1)
 * limit?: number              // Items per page (default: 20, max: 100)
 * sortBy?: string             // Sort field (createdAt | updatedAt | calories | foodName)
 * sortOrder?: string          // Sort order (asc | desc)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Diet search completed successfully",
 *   "data": [...],
 *   "pagination": { ... }
 * }
 */
const searchDietsController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { q: searchQuery } = req.query;
    const { page, limit, sortBy, sortOrder } = req.query;
    const options = {
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
        ...(sortBy && { sortBy: sortBy }),
        ...(sortOrder && { sortOrder: sortOrder })
    };
    const result = yield dietService_1.default.searchDietsService(searchQuery, userId, options);
    res.status(200).json({
        success: true,
        message: "Diet search completed successfully",
        data: result.diets,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
}));
exports.searchDietsController = searchDietsController; 