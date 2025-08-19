import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import DietProgressServices from "../services/ProgressServices/dietProgressServices";

import { WorkoutProgressServices } from "../services/ProgressServices/workoutProgressServices";
import { SleepProgressServices } from "../services/ProgressServices/sleepPorgressService";

const getWorkoutGraphProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    // Extract viewType from query params (default to 'week')
    const { viewType = "week" } = req.query;

    // Call the workout graph progress service
    const result = await WorkoutProgressServices.getWorkoutGraphProgressService(
      {
        userId,
        viewType: viewType as "day" | "week" | "month",
      }
    );

    res.status(200).json({
      result,
    });
  } catch (err) {
    next(err);
  }
};

const getWorkoutGoalProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract goalId from URL parameters
    const { goalId } = req.params;

    // Call the workout goal progress service
    const result =
      await WorkoutProgressServices.getWorkoutGoalProgressService(goalId);

    res.status(200).json({
      result,
    });
  } catch (err) {
    next(err);
  }
};

const getWeightGoalProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const goalId = req.params.goalId;
  } catch (err) {
    next(err);
  }
};

const getDietGoalProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const goalId = req.params.goalId;

    // Fix: Call the service method with goalId parameter
    const result =
      await DietProgressServices.getDietGoalProgressService(goalId);

    res.status(200).json({
      success: true,
      message: result.message,
      progress: result.progress,
    });
  } catch (err) {
    next(err);
  }
};

const getDietGraphProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    // Get viewType from query parameters or body
    const viewType = req.query.viewType ? req.query.viewType : "week";

    // Call the service method
    const result = await DietProgressServices.getDietGraphProgressService({
      userId,
      viewType: viewType,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      dateRange: result.dateRange,
    });
  } catch (err) {
    next(err);
  }
};

const getWeightGraphProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
  } catch (err) {
    next(err);
  }
};

const getSleepGraphStatsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    // Extract viewType from query params (default to 'week')
    const { viewType = "week" } = req.query;

    const result = await SleepProgressServices.getSleepGraphDataService({
      userId,
      viewType,
    });

    res.status(200).json({
      result,
    });
  } catch (err) {
    next(err);
  }
};

export {
  getDietGoalProgressController,
  getDietGraphProgressController,
  getWeightGraphProgressController,
  getWorkoutGoalProgressController,
  getWeightGoalProgressController,
  getWorkoutGraphProgressController,
  getSleepGraphStatsController,
};
