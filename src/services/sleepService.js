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
const SleepModel_1 = require("../models/SleepModel");
const customError_1 = require("../utils/customError");
const mongoose_1 = __importDefault(require("mongoose"));

class SleepServices {
    static DEFAULT_PAGE = 1;
    static DEFAULT_LIMIT = 20;
    static MAX_LIMIT = 100;
    static DEFAULT_SORT_BY = "createdAt";
    static DEFAULT_SORT_ORDER = "desc";

    /**
     * Sanitizes pagination options with defaults and limits
     */
    static sanitizeOptions(options) {
        const page = Math.max(1, options.page || this.DEFAULT_PAGE);
        const limit = Math.min(this.MAX_LIMIT, Math.max(1, options.limit || this.DEFAULT_LIMIT));
        const sortBy = options.sortBy || this.DEFAULT_SORT_BY;
        const sortOrder = options.sortOrder || this.DEFAULT_SORT_ORDER;

        return { page, limit, sortBy, sortOrder };
    }

    /**
     * Creates a new sleep entry for a user
     */
    static createSleepService(sleepInput) {
        return __awaiter(this, arguments, void 0, function* ({ userId, duration, date, goalId }) {
            try {
                // Check for existing entry (considering the unique index)
                const existingSleep = yield SleepModel_1.default.findOne({
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    date: new Date(date)
                });

                if (existingSleep) {
                    throw new customError_1.CustomError("Sleep entry already exists for this date", 409);
                }

                // Create new sleep entry
                const newSleep = yield SleepModel_1.default.create({
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    duration,
                    date: new Date(date),
                    goalId: goalId ? new mongoose_1.default.Types.ObjectId(goalId) : undefined
                });

                return newSleep;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                if (error.code === 11000) {
                    throw new customError_1.CustomError("Sleep entry already exists for this date", 409);
                }
                throw new customError_1.CustomError("Failed to create sleep entry", 500);
            }
        });
    }

    /**
     * Gets all sleep entries for a user with pagination and filtering
     */
    static getSleepService(userId, options = {}) {
        return __awaiter(this, arguments, void 0, function* () {
            const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };

            const { page, limit, sortBy, sortOrder } = this.sanitizeOptions(options);
            const sortDirection = sortOrder === "asc" ? 1 : -1;

            try {
                const [sleep, total] = yield Promise.all([
                    SleepModel_1.default.find(query)
                        .sort({ [sortBy]: sortDirection })
                        .skip((page - 1) * limit)
                        .limit(limit)
                        .lean(),
                    SleepModel_1.default.countDocuments(query)
                ]);

                const totalPages = Math.ceil(total / limit);

                return {
                    sleep,
                    total,
                    page,
                    limit,
                    totalPages
                };
            }
            catch (error) {
                throw new customError_1.CustomError("Failed to retrieve sleep entries", 500);
            }
        });
    }

    /**
     * Gets a sleep entry by id
     */
    static getSleepByIdService(sleepId) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                const sleep = yield SleepModel_1.default.findById(sleepId).lean();
                if (!sleep) {
                    throw new customError_1.CustomError("Sleep entry not found", 404);
                }
                return sleep;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                throw new customError_1.CustomError("Failed to retrieve sleep entry", 500);
            }
        });
    }

    /**
     * Updates a sleep entry by id
     */
    static updateSleepService(sleepId, sleepInput) {
        return __awaiter(this, arguments, void 0, function* () {
            if (!sleepInput || Object.keys(sleepInput).length === 0) {
                throw new customError_1.CustomError("No updates provided", 400);
            }

            // Sanitize updates
            const sanitizedUpdates = {};

            if (sleepInput.userId !== undefined) {
                sanitizedUpdates.userId = new mongoose_1.default.Types.ObjectId(sleepInput.userId);
            }

            if (sleepInput.goalId !== undefined) {
                sanitizedUpdates.goalId = sleepInput.goalId ? new mongoose_1.default.Types.ObjectId(sleepInput.goalId) : null;
            }

            // Copy other valid fields
            ['duration', 'date'].forEach(field => {
                if (sleepInput[field] !== undefined) {
                    sanitizedUpdates[field] = field === 'date' ? new Date(sleepInput[field]) : sleepInput[field];
                }
            });

            try {
                const sleep = yield SleepModel_1.default.findByIdAndUpdate(sleepId, sanitizedUpdates, { new: true, runValidators: true });
                if (!sleep) {
                    throw new customError_1.CustomError("Sleep entry not found", 404);
                }
                return sleep;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                if (error.code === 11000) {
                    throw new customError_1.CustomError("Sleep entry already exists for this date", 409);
                }
                throw new customError_1.CustomError("Failed to update sleep entry", 500);
            }
        });
    }
    
    /**
     * Deletes a sleep entry by id
     */
    static deleteSleepService(sleepId) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                const sleep = yield SleepModel_1.default.findByIdAndDelete(sleepId);
                if (!sleep) {
                    throw new customError_1.CustomError("Sleep entry not found", 404);
                }
                return sleep;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                throw new customError_1.CustomError("Failed to delete sleep entry", 500);
            }
        });
    }

    /**
     * Gets a sleep entry by date
     */
    static getSleepByDateService(date, userId) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                const query = { date: new Date(date) };
                if (userId) {
                    query.userId = new mongoose_1.default.Types.ObjectId(userId);
                }
                const sleep = yield SleepModel_1.default.findOne(query).lean();
                return sleep;
            }
            catch (error) {
                throw new customError_1.CustomError("Failed to retrieve sleep entry by date", 500);
            }
        });
    }

    /**
     * Get sleep stats for a user
     */
    static getSleepStatsService(userId, startDate, endDate) {
        return __awaiter(this, arguments, void 0, function* () {
            const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };

            // Add date range if provided
            if (startDate || endDate) {
                query.date = {};
                if (startDate) {
                    query.date.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.date.$lte = new Date(endDate);
                }
            }

            try {
                const result = yield SleepModel_1.default.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: null,
                            totalDuration: { $sum: "$duration" },
                            averageDuration: { $avg: "$duration" },
                            entryCount: { $sum: 1 },
                            minDuration: { $min: "$duration" },
                            maxDuration: { $max: "$duration" }
                        }
                    }
                ]);

                if (!result || result.length === 0) {
                    throw new customError_1.CustomError("No sleep entries found for this user", 404);
                }

                const stats = result[0];
                return {
                    totalDuration: Math.round(stats.totalDuration * 100) / 100,
                    averageDuration: Math.round(stats.averageDuration * 100) / 100,
                    entryCount: stats.entryCount,
                    minDuration: stats.minDuration,
                    maxDuration: stats.maxDuration
                };
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                throw new customError_1.CustomError("Failed to calculate sleep stats", 500);
            }
        });
    }

    /**
     * Create multiple sleep records for a user
     */
    static createMultipleSleepService(sleepInput) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                // Transform the input to ensure proper ObjectId conversion
                const transformedInput = sleepInput.map(input => ({
                    userId: new mongoose_1.default.Types.ObjectId(input.userId),
                    duration: input.duration,
                    date: new Date(input.date),
                    goalId: input.goalId ? new mongoose_1.default.Types.ObjectId(input.goalId) : undefined
                }));

                const sleep = yield SleepModel_1.default.insertMany(transformedInput);
                return sleep;
            }
            catch (error) {
                if (error.code === 11000) {
                    throw new customError_1.CustomError("One or more sleep entries already exist for the specified dates", 409);
                }
                throw new customError_1.CustomError("Failed to create multiple sleep entries", 500);
            }
        });
    }

    /**
     * Get sleep entries for a specific date range
     */
    static getSleepByDateRangeService(userId, startDate, endDate, options = {}) {
        return __awaiter(this, arguments, void 0, function* () {
            const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };

            // Add date range
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }

            const { page, limit, sortBy, sortOrder } = this.sanitizeOptions(options);
            const sortDirection = sortOrder === "asc" ? 1 : -1;

            try {
                const [sleep, total] = yield Promise.all([
                    SleepModel_1.default.find(query)
                        .sort({ [sortBy]: sortDirection })
                        .skip((page - 1) * limit)
                        .limit(limit)
                        .lean(),
                    SleepModel_1.default.countDocuments(query)
                ]);

                const totalPages = Math.ceil(total / limit);

                return {
                    sleep,
                    total,
                    page,
                    limit,
                    totalPages
                };
            }
            catch (error) {
                throw new customError_1.CustomError("Failed to retrieve sleep entries for date range", 500);
            }
        });
    }

    /**
     * Get today's sleep entry for a user
     */
    static getUserTodaySleepService(userId) {
        return __awaiter(this, arguments, void 0, function* () {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            return this.getSleepByDateRangeService(userId, today.toISOString(), tomorrow.toISOString());
        });
    }
}

exports.default = SleepServices;