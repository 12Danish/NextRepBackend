import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import GoalServices from "../services/goalServices";

/**
 * @desc    Add a new goal for the authenticated user
 * @route   POST /api/goals
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @body
 * {
 *   "category": "string",      // Category of the goal
 *   "startDate": "Date",       // Goal start date
 *   "description": "string",   // Description of the goal
 *   "targetDate": "Date",      // Goal target date
 *   "status": "string",        // e.g., "pending" or "completed"
 *   "data": "object"           // Additional goal data
 * }
 *
 * @returns
 * {
 *   "message": "Goal created successfully",
 *   "newGoal": { ...goalObject }
 * }
 * @errors
 * - 500 in case of unexpected error
 */
const addGoalController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const { category, startDate, description, targetDate, status, data } = req.body;
    const endDate = status === "completed" ? new Date(targetDate) : null;

    const newGoal = await GoalServices.addGoalService({
      category,
      startDate,
      description,
      targetDate,
      endDate,
      status,
      userId,
      data,
    });

    res.status(200).json({ message: "Goal created successfully", newGoal });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a goal by ID
 * @route   DELETE /api/goals/:id
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @params
 * :id - Goal ID
 *
 * @returns
 * {
 *   "message": "Goal deleted successfully."
 * }
 * @errors
 * - 500 in case of unexpected error
 */
const deleteGoalController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const goalId: string = req.params.id;
    await GoalServices.deleteGoalService(goalId);
    res.status(200).json({ message: "Goal deleted successfully." });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update goal details by ID
 * @route   PATCH /api/goals/:id
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @params
 * :id - Goal ID
 *
 * @body
 * {
 *   "fieldToUpdate": "value"
 * }
 *
 * @returns
 * {
 *   "message": "Goal updated successfully.",
 *   "data": { ...updatedGoal }
 * }
 * @errors
 * - 500 in case of unexpected error
 */
const updateGoalDetailsController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const goalId: string = req.params.id;
    const updates = req.body;
    const updatedGoal = await GoalServices.updateGoalDetailsService({ goalId, updates });

    res.status(200).json({ message: "Goal updated successfully.", data: updatedGoal });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get paginated goals for the authenticated user
 * @route   GET /api/goals
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @query
 * page (number)      - Page number (default 1)
 * limit (number)     - Items per page (default 4)
 * category (string)  - Optional filter
 * status (string)    - Optional filter
 *
 * @returns
 * {
 *   "message": "Goals fetched",
 *   "goals": [ ... ]
 * }
 */
const getGoalsController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 4;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const goalsData = await GoalServices.getGoalsService({ category, status, skip, limit, userId });
    res.status(200).json({ message: "Goals fetched", goalsData: goalsData });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get count of goals matching filters
 * @route   GET /api/goals/count
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @query
 * category (string)  - Optional filter
 * status (string)    - Optional filter
 *
 * @returns
 * {
 *   "message": "Goals fetched",
 *   "goalsCount": number
 * }
 */
const getGoalsCountController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    const status = req.query.status as string;
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const goalsCount = await GoalServices.getGoalsCountService({ category, status, userId });
    res.status(200).json({ message: "Goals fetched", goalsCount });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get overall goal progress for the authenticated user
 * @route   GET /api/goals/progress
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @returns
 * {
 *   "message": "Progress fetched",
 *   "progress": { ... }
 * }
 */
const getOverallProgressController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const progress = await GoalServices.getOverallProgressService(userId);

    res.status(200).json({ message: "Progress fetched", progress });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get upcoming goals for the authenticated user
 * @route   GET /api/goals/upcoming
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @returns
 * {
 *   "message": "Successfully fetched upcoming goals",
 *   "goals": [ ... ]
 * }
 */
const getUpcomingGoalsController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const upcomingGoals = await GoalServices.getUpcomingGoalsService(userId);

    res.status(200).json({ message: "Successfully fetched upcoming goals", goals: upcomingGoals });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle goal completion status
 * @route   PATCH /api/goals/:id/status
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @params
 * :id - Goal ID
 *
 * @query
 * currentStatus (string) - Current status of the goal
 *
 * @returns
 * {
 *   "message": "Goal status updated",
 *   "goal": { ... }
 * }
 */
const changeGoalCompletionStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const goalId: string = req.params.id;
    const currentStatus = req.query.currentStatus;
    const updatedGoal = await GoalServices.changeGoalStatusService({ goalId, currentStatus });

    res.status(200).json({ message: "Goal status updated", goal: updatedGoal });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update overdue status for goals
 * @route   PATCH /api/goals/overdue
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @returns
 * {
 *   "message": "Goal statuses successfully updated"
 * }
 */
const UpdateGoalsOverdueStatusController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const updated = await GoalServices.updateGoalStatusService(userId);

    if (updated) {
      res.status(200).json({ message: "Goal statuses successfully updated" });
    }
  } catch (err) {
    next(err);
  }
};

export {
  addGoalController,
  deleteGoalController,
  updateGoalDetailsController,
  getGoalsController,
  getGoalsCountController,
  getUpcomingGoalsController,
  getOverallProgressController,
  changeGoalCompletionStatus,
  UpdateGoalsOverdueStatusController,
};
