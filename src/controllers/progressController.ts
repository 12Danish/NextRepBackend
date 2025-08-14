import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const getSleepGoalProgressController = async (
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

const getWorkoutGraphProgressController = async (
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

const getDietGoalProgressController = async (
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

const getDietGraphProgressController = async (
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

const getWeightGoalProgressController = async (
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

const getWorkoutGoalProgressController = async (
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

export {
  getDietGoalProgressController,
  getDietGraphProgressController,
  getSleepGoalProgressController,
  getWeightGraphProgressController,
  getWorkoutGoalProgressController,
  getWeightGoalProgressController,
  getWorkoutGraphProgressController,
};
