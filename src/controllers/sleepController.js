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
exports.getSleepTrendsController = exports.getSleepSummaryController = exports.getAllSleepController = exports.getUserSleepByDateController = exports.getUserTodaySleepController = exports.getSleepByDateRangeController = exports.createMultipleSleepController = exports.getSleepStatsController = exports.getSleepByDateController = exports.deleteSleepController = exports.updateSleepController = exports.getSleepByIdController = exports.getSleepController = exports.createSleepController = void 0;
const sleepService_1 = __importDefault(require("../services/sleepService"));
const customError_1 = require("../utils/customError");

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Create new sleep entry
 * @route   POST /api/sleep
 * @access  Private
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * {
 *   "userId": "string",        // MongoDB ObjectId
 *   "duration": "number",      // Duration in minutes (0-1440)
 *   "date": "string",          // Date in ISO format
 *   "goalId": "string"         // MongoDB ObjectId
 * }
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep entry created successfully",
 *   "data": { ... }
 * }
 */
const createSleepController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sleepData = req.body;
    const newSleep = yield sleepService_1.default.createSleepService(sleepData);
    res.status(201).json({
        success: true,
        message: "Sleep entry created successfully",
        data: newSleep
    });
}));
exports.createSleepController = createSleepController;

/**
 * @desc    Get sleep entries for a user
 * @route   GET /api/sleep/:userId
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep entries retrieved successfully",
 *   "data": [...]
 * }
 */
const getSleepController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const sleepEntries = yield sleepService_1.default.getSleepService(userId);
    res.status(200).json({
        success: true,
        message: "Sleep entries retrieved successfully",
        data: sleepEntries
    });
}));
exports.getSleepController = getSleepController;

/**
 * @desc    Get specific sleep entry by ID
 * @route   GET /api/sleep/entry/:sleepId
 * @access  Private
 *
 * @params
 * sleepId: string             // MongoDB ObjectId
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep entry retrieved successfully",
 *   "data": { ... }
 * }
 */
const getSleepByIdController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sleepId } = req.params;
    const sleep = yield sleepService_1.default.getSleepByIdService(sleepId);
    res.status(200).json({
        success: true,
        message: "Sleep entry retrieved successfully",
        data: sleep
    });
}));
exports.getSleepByIdController = getSleepByIdController;

/**
 * @desc    Update sleep entry
 * @route   PUT /api/sleep/:sleepId
 * @access  Private
 *
 * @params
 * sleepId: string             // MongoDB ObjectId
 *
 * @body
 * {
 *   "duration": "number",     // Optional: Duration in minutes (0-1440)
 *   "date": "string",         // Optional: Date in ISO format
 *   "goalId": "string"        // Optional: MongoDB ObjectId
 * }
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep entry updated successfully",
 *   "data": { ... }
 * }
 */
const updateSleepController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sleepId } = req.params;
    const updates = req.body;
    const updatedSleep = yield sleepService_1.default.updateSleepService(sleepId, updates);
    res.status(200).json({
        success: true,
        message: "Sleep entry updated successfully",
        data: updatedSleep
    });
}));
exports.updateSleepController = updateSleepController;

/**
 * @desc    Delete sleep entry
 * @route   DELETE /api/sleep/:sleepId
 * @access  Private
 *
 * @params
 * sleepId: string             // MongoDB ObjectId
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep entry deleted successfully",
 *   "data": { ... }
 * }
 */
const deleteSleepController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sleepId } = req.params;
    const deletedSleep = yield sleepService_1.default.deleteSleepService(sleepId);
    res.status(200).json({
        success: true,
        message: "Sleep entry deleted successfully",
        data: deletedSleep
    });
}));
exports.deleteSleepController = deleteSleepController;

/**
 * @desc    Get sleep entry by date
 * @route   GET /api/sleep/date/:date
 * @access  Private
 *
 * @params
 * date: string                // Date in ISO format (YYYY-MM-DD)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep entry for date retrieved successfully",
 *   "data": { ... }
 * }
 */
const getSleepByDateController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.params;
    const sleepEntry = yield sleepService_1.default.getSleepByDateService(new Date(date));
    res.status(200).json({
        success: true,
        message: "Sleep entry for date retrieved successfully",
        data: sleepEntry
    });
}));
exports.getSleepByDateController = getSleepByDateController;

/**
 * @desc    Get sleep stats for a user
 * @route   GET /api/sleep/stats/:userId
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep statistics retrieved successfully",
 *   "data": [...]
 * }
 */
const getSleepStatsController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const stats = yield sleepService_1.default.getSleepStatsService(userId);
    res.status(200).json({
        success: true,
        message: "Sleep statistics retrieved successfully",
        data: stats
    });
}));
exports.getSleepStatsController = getSleepStatsController;

/**
 * @desc    Create multiple sleep records
 * @route   POST /api/sleep/bulk
 * @access  Private
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * [
 *   {
 *     "userId": "string",     // MongoDB ObjectId
 *     "duration": "number",   // Duration in minutes (0-1440)
 *     "date": "string",       // Date in ISO format
 *     "goalId": "string"      // MongoDB ObjectId
 *   },
 *   ...
 * ]
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Multiple sleep entries created successfully",
 *   "data": [...],
 *   "count": 5
 * }
 */
const createMultipleSleepController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sleepDataArray = req.body;
    const newSleepEntries = yield sleepService_1.default.createMultipleSleepService(sleepDataArray);
    res.status(201).json({
        success: true,
        message: "Multiple sleep entries created successfully",
        data: newSleepEntries,
        count: newSleepEntries.length
    });
}));
exports.createMultipleSleepController = createMultipleSleepController;

/**
 * @desc    Get sleep entries for a specific date range
 * @route   GET /api/sleep/range/:userId/:startDate/:endDate
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 * startDate: string           // Start date in ISO format
 * endDate: string             // End date in ISO format
 *
 * @query
 * page?: number               // Page number (default: 1)
 * limit?: number              // Items per page (default: 20, max: 100)
 * sortBy?: string             // Sort field (createdAt | updatedAt | date | duration)
 * sortOrder?: string          // Sort order (asc | desc)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep entries for date range retrieved successfully",
 *   "data": [...],
 *   "pagination": { ... }
 * }
 */
const getSleepByDateRangeController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, startDate, endDate } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    const options = {
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
        ...(sortBy && { sortBy: sortBy }),
        ...(sortOrder && { sortOrder: sortOrder })
    };
    const result = yield sleepService_1.default.getSleepByDateRangeService(userId, startDate, endDate, options);
    res.status(200).json({
        success: true,
        message: `Sleep entries for date range ${startDate} to ${endDate} retrieved successfully`,
        data: result.sleep,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
}));
exports.getSleepByDateRangeController = getSleepByDateRangeController;

/**
 * @desc    Get today's sleep entry for a user
 * @route   GET /api/sleep/today/:userId
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Today's sleep entry retrieved successfully",
 *   "data": [...],
 *   "pagination": { ... }
 * }
 */
const getUserTodaySleepController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const result = yield sleepService_1.default.getUserTodaySleepService(userId);
    res.status(200).json({
        success: true,
        message: "Today's sleep entry retrieved successfully",
        data: result.sleep,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
}));
exports.getUserTodaySleepController = getUserTodaySleepController;

/**
 * @desc    Get sleep entries for specific date
 * @route   GET /api/sleep/user/:userId/date/:date
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 * date: string                // Date in ISO format (YYYY-MM-DD)
 *
 * @query
 * page?: number               // Page number (default: 1)
 * limit?: number              // Items per page (default: 20, max: 100)
 * sortBy?: string             // Sort field (createdAt | updatedAt | date | duration)
 * sortOrder?: string          // Sort order (asc | desc)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep entries for 2024-01-15 retrieved successfully",
 *   "data": [...],
 *   "pagination": { ... }
 * }
 */
const getUserSleepByDateController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, date } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    const options = {
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
        ...(sortBy && { sortBy: sortBy }),
        ...(sortOrder && { sortOrder: sortOrder })
    };
    const result = yield sleepService_1.default.getSleepByDateRangeService(userId, date, date, options);
    res.status(200).json({
        success: true,
        message: `Sleep entries for ${date} retrieved successfully`,
        data: result.sleep,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
}));
exports.getUserSleepByDateController = getUserSleepByDateController;

/**
 * @desc    Get all sleep entries for a specific user (alias for getSleepController)
 * @route   GET /api/sleep/all/:userId
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "All sleep entries retrieved successfully",
 *   "data": [...]
 * }
 */
const getAllSleepController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const sleepEntries = yield sleepService_1.default.getSleepService(userId);
    res.status(200).json({
        success: true,
        message: "All sleep entries retrieved successfully",
        data: sleepEntries
    });
}));
exports.getAllSleepController = getAllSleepController;

/**
 * @desc    Get sleep summary for a user (weekly/monthly overview)
 * @route   GET /api/sleep/summary/:userId
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @query
 * period?: string             // Period type: week | month | year (default: week)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Weekly sleep summary retrieved successfully",
 *   "data": {
 *     "period": "week",
 *     "startDate": "2024-01-08T00:00:00.000Z",
 *     "endDate": "2024-01-15T00:00:00.000Z",
 *     "totalDuration": 4200,
 *     "averageDuration": 600,
 *     "entryCount": 7,
 *     "minDuration": 480,
 *     "maxDuration": 720
 *   }
 * }
 */
const getSleepSummaryController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { period = "week" } = req.query; // week, month, year
    let startDate;
    let endDate;
    const now = new Date();
    switch (period) {
        case "week":
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            startDate = weekAgo.toISOString();
            endDate = now.toISOString();
            break;
        case "month":
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            startDate = monthAgo.toISOString();
            endDate = now.toISOString();
            break;
        case "year":
            const yearAgo = new Date(now);
            yearAgo.setFullYear(now.getFullYear() - 1);
            startDate = yearAgo.toISOString();
            endDate = now.toISOString();
            break;
        default:
            throw new customError_1.CustomError("Invalid period. Must be 'week', 'month', or 'year'", 400);
    }
    const stats = yield sleepService_1.default.getSleepStatsService(userId, startDate, endDate);
    res.status(200).json({
        success: true,
        message: `${period}ly sleep summary retrieved successfully`,
        data: {
            period,
            startDate,
            endDate,
            ...stats
        }
    });
}));
exports.getSleepSummaryController = getSleepSummaryController;

/**
 * @desc    Get sleep trends for a user
 * @route   GET /api/sleep/trends/:userId
 * @access  Private
 *
 * @params
 * userId: string              // MongoDB ObjectId
 *
 * @query
 * days?: string               // Number of days to analyze (default: 30)
 *
 * @returns
 * {
 *   "success": true,
 *   "message": "Sleep trends retrieved successfully",
 *   "data": {
 *     "period": "30 days",
 *     "averageDuration": 420.5,
 *     "totalEntries": 30,
 *     "trends": [
 *       {
 *         "date": "2024-01-01T00:00:00.000Z",
 *         "duration": 480,
 *         "deviation": 59.5
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
const getSleepTrendsController = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { days = "30" } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    const startDate = daysAgo.toISOString();
    const endDate = new Date().toISOString();
    const result = yield sleepService_1.default.getSleepByDateRangeService(userId, startDate, endDate, {
        sortBy: "date",
        sortOrder: "asc"
    });
    // Calculate trends
    const sleepEntries = result.sleep;
    const averageDuration = sleepEntries.length > 0
        ? sleepEntries.reduce((sum, entry) => sum + entry.duration, 0) / sleepEntries.length
        : 0;
    const trendData = sleepEntries.map(entry => ({
        date: entry.date,
        duration: entry.duration,
        deviation: entry.duration - averageDuration
    }));
    res.status(200).json({
        success: true,
        message: "Sleep trends retrieved successfully",
        data: {
            period: `${days} days`,
            averageDuration: Math.round(averageDuration * 100) / 100,
            totalEntries: sleepEntries.length,
            trends: trendData
        }
    });
}));
exports.getSleepTrendsController = getSleepTrendsController; 