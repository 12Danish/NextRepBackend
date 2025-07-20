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
const DietModel_1 = require("../models/DietModel");
const customError_1 = require("../utils/customError");
const mongoose_1 = __importDefault(require("mongoose"));

class DietServices {
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
     * Creates a new diet entry for a user
     */
    static createDietService(dietInput) {
        return __awaiter(this, arguments, void 0, function* ({ foodName, userId, meal, calories, carbs, protein, fat, status = "next", goalId }) {
            try {
                // Check for existing entry (considering the unique index)
                const existingDiet = yield DietModel_1.Diet.findOne({
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    meal,
                    foodName: foodName.trim()
                });

                if (existingDiet) {
                    throw new customError_1.CustomError("Diet entry already exists for this meal and food", 409);
                }

                // Create new diet entry
                const newDiet = yield DietModel_1.Diet.create({
                    foodName: foodName.trim(),
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    meal,
                    calories,
                    carbs,
                    protein,
                    fat,
                    status,
                    goalId: goalId ? new mongoose_1.default.Types.ObjectId(goalId) : undefined
                });

                return newDiet;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                if (error.code === 11000) {
                    throw new customError_1.CustomError("Diet entry already exists for this meal and food", 409);
                }
                throw new customError_1.CustomError("Failed to create diet entry", 500);
            }
        });
    }

    /**
     * Get diets with flexible filters, pagination, and sorting
     */
    static getDietsService(filters = {}, options = {}) {
        return __awaiter(this, arguments, void 0, function* () {
            const query = {};

            // Build query from validated filters
            if (filters.userId) {
                query.userId = new mongoose_1.default.Types.ObjectId(filters.userId);
            }
            if (filters.meal)
                query.meal = filters.meal;
            if (filters.status)
                query.status = filters.status;

            // Date range handling
            if (filters.startDate || filters.endDate) {
                query.createdAt = {};
                if (filters.startDate) {
                    query.createdAt.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    query.createdAt.$lte = new Date(filters.endDate);
                }
            }

            const { page, limit, sortBy, sortOrder } = this.sanitizeOptions(options);
            const sortDirection = sortOrder === "asc" ? 1 : -1;

            try {
                const [diets, total] = yield Promise.all([
                    DietModel_1.Diet.find(query)
                        .sort({ [sortBy]: sortDirection })
                        .skip((page - 1) * limit)
                        .limit(limit)
                        .lean(),
                    DietModel_1.Diet.countDocuments(query)
                ]);

                const totalPages = Math.ceil(total / limit);

                return {
                    diets,
                    total,
                    page,
                    limit,
                    totalPages
                };
            }
            catch (error) {
                throw new customError_1.CustomError("Failed to retrieve diet entries", 500);
            }
        });
    }

    /**
     * Retrieves a specific diet entry by its ID
     */
    static getDietByIdService(dietId) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                const diet = yield DietModel_1.Diet.findById(dietId).lean();
                if (!diet) {
                    throw new customError_1.CustomError("Diet entry not found", 404);
                }
                return diet;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                throw new customError_1.CustomError("Failed to retrieve diet entry", 500);
            }
        });
    }

    /**
     * Updates a specific diet entry by its ID
     */
    static updateDietService(dietId, updates) {
        return __awaiter(this, arguments, void 0, function* () {
            if (!updates || Object.keys(updates).length === 0) {
                throw new customError_1.CustomError("No updates provided", 400);
            }

            // Sanitize updates
            const sanitizedUpdates = {};

            if (updates.foodName !== undefined) {
                sanitizedUpdates.foodName = updates.foodName.trim();
            }

            if (updates.userId !== undefined) {
                sanitizedUpdates.userId = new mongoose_1.default.Types.ObjectId(updates.userId);
            }

            if (updates.goalId !== undefined) {
                sanitizedUpdates.goalId = updates.goalId ? new mongoose_1.default.Types.ObjectId(updates.goalId) : null;
            }

            // Copy other valid fields
            ['meal', 'status', 'calories', 'carbs', 'protein', 'fat'].forEach(field => {
                if (updates[field] !== undefined) {
                    sanitizedUpdates[field] = updates[field];
                }
            });

            try {
                const diet = yield DietModel_1.Diet.findByIdAndUpdate(dietId, sanitizedUpdates, { new: true, runValidators: true });

                if (!diet) {
                    throw new customError_1.CustomError("Diet entry not found", 404);
                }
                return diet;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                if (error.code === 11000) {
                    throw new customError_1.CustomError("Diet entry already exists for this meal and food", 409);
                }
                throw new customError_1.CustomError("Failed to update diet entry", 500);
            }
        });
    }

    /**
     * Deletes a specific diet entry by its ID
     */
    static deleteDietService(dietId) {
        return __awaiter(this, arguments, void 0, function* () {
            try {
                const diet = yield DietModel_1.Diet.findByIdAndDelete(dietId);
                if (!diet) {
                    throw new customError_1.CustomError("Diet entry not found", 404);
                }
                return diet;
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                throw new customError_1.CustomError("Failed to delete diet entry", 500);
            }
        });
    }

    /**
     * Retrieves all diet entries for a specific user
     */
    static getUserDietService(userId, options = {}) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.getDietsService({ userId }, options);
        });
    }

    /**
     * Retrieves nutrition summary for a user
     */
    static getUserNutritionSummaryService(userId, startDate, endDate) {
        return __awaiter(this, arguments, void 0, function* () {
            const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };

            // Add date range if provided
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) {
                    query.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.createdAt.$lte = new Date(endDate);
                }
            }

            try {
                const result = yield DietModel_1.Diet.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: null,
                            calories: { $sum: "$calories" },
                            carbs: { $sum: "$carbs" },
                            protein: { $sum: "$protein" },
                            fat: { $sum: "$fat" },
                            entryCount: { $sum: 1 }
                        }
                    }
                ]);

                if (!result || result.length === 0) {
                    throw new customError_1.CustomError("No diet entries found for this user", 404);
                }

                const summary = result[0];
                return {
                    calories: Math.round(summary.calories * 100) / 100,
                    carbs: Math.round(summary.carbs * 100) / 100,
                    protein: Math.round(summary.protein * 100) / 100,
                    fat: Math.round(summary.fat * 100) / 100,
                    entryCount: summary.entryCount
                };
            }
            catch (error) {
                if (error instanceof customError_1.CustomError)
                    throw error;
                throw new customError_1.CustomError("Failed to calculate nutrition summary", 500);
            }
        });
    }

    /**
     * Retrieves diet entries for a specific date
     */
    static getUserDietByDateService(userId, date, options = {}) {
        return __awaiter(this, arguments, void 0, function* () {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            return this.getDietsService({
                userId,
                startDate: startOfDay.toISOString(),
                endDate: endOfDay.toISOString()
            }, options);
        });
    }

    /**
     * Retrieves today's diet entries for a user
     */
    static getUserTodayDietService(userId, options = {}) {
        return __awaiter(this, arguments, void 0, function* () {
            const today = new Date().toISOString().split('T')[0];
            return this.getUserDietByDateService(userId, today, options);
        });
    }

    /**
     * Searches for diet entries based on query string
     */
    static searchDietsService(searchQuery, userId, options = {}) {
        return __awaiter(this, arguments, void 0, function* () {
            const { page, limit, sortBy, sortOrder } = this.sanitizeOptions(options);
            const sortDirection = sortOrder === "asc" ? 1 : -1;

            const query = {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                foodName: { $regex: searchQuery.trim(), $options: "i" }
            };

            try {
                const [diets, total] = yield Promise.all([
                    DietModel_1.Diet.find(query)
                        .sort({ [sortBy]: sortDirection })
                        .skip((page - 1) * limit)
                        .limit(limit)
                        .lean(),
                    DietModel_1.Diet.countDocuments(query)
                ]);

                const totalPages = Math.ceil(total / limit);

                return {
                    diets,
                    total,
                    page,
                    limit,
                    totalPages
                };
            }
            catch (error) {
                throw new customError_1.CustomError("Failed to search diet entries", 500);
            }
        });
    }
}

exports.default = DietServices; 