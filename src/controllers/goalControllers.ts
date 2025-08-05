import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import GoalServices from "../services/goalServices";
import { CustomError } from "../utils/customError";
import { messaging } from "firebase-admin";

const addGoalController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const {
      category,
      startDate,
      endDate,
      description,
      targetDate,
      status,
      data,
    } = req.body;

    const newGoal = await GoalServices.addGoalService({
      category,
      startDate,
      endDate,
      description,
      targetDate,
      status,
      userId,
      data,
    });

    res
      .status(200)
      .json({ message: "Goal created successfully", newGoal: newGoal });
  } catch (err: any) {
    next(err);
  }
};

const deleteGoalController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const goalId: string = req.params.id;

    await GoalServices.deleteGoalService(goalId);

    res.status(200).json({ message: "Goal deleted successfully." });
  } catch (err: any) {
    next(err);
  }
};

const updateGoalDetailsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const goalId: string = req.params.id;

    const updates = req.body;

    const updatedGoal = await GoalServices.updateGoalDetailsService({
      goalId,
      updates,
    });

    res
      .status(200)
      .json({ message: "Goal updated successfully.", data: updatedGoal });
  } catch (err: any) {
    next(err);
  }
};

const getGoalsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 4;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    console.log("This is the status being received");
    console.log(status);

    const goals = await GoalServices.getGoalsService({
      category,
      status,
      skip,
      limit,
      userId,
    });

    res.status(200).json({ message: "Goals fetched", goals: goals });
  } catch (err) {
    next(err);
  }
};

const getGoalsCountController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = req.query.category as string;
    const status = req.query.status as string;
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const goalsCount = await GoalServices.getGoalsCountService({
      category,
      status,
      userId,
    });

    res.status(200).json({ message: "Goals fetched", goalsCount: goalsCount });
  } catch (err) {
    next(err);
  }
};

const getOverallProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    console.log("Progress controller called")
    const progress = await GoalServices.getOverallProgressService(userId);

    res.status(200).json({ message: "Progress fetched", progress: progress });
  } catch (err) {
    next(err);
  }
};

const getUpcomingGoalsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const upcomingGoals = await GoalServices.getUpcomingGoalsService(userId);

    res.status(200).json({
      message: "Successfully fetched upcoming goals",
      goals: upcomingGoals,
    });
  } catch (err) {
    next(err);
  }
};

const markGoalAsCompletedController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const goalId: string = req.params.id;

    const updatedGoal = await GoalServices.markGoalAsCompleteService(goalId);
    res
      .status(200)
      .json({ message: "Goal marked as complete", goal: updatedGoal });
  } catch (err) {
    next(err);
  }
};

const UpdateGoalsOverdueStatusController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
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
  markGoalAsCompletedController,
  UpdateGoalsOverdueStatusController,
};
