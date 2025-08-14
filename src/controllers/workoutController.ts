import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import WorkoutServices from "../services/workoutServices";

const addWorkoutController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const {
      exerciseName,
      type,
      duration,
      reps,
      targetMuscleGroup,
      goalId,
      workoutDateAndTime,
    } = req.body;

    const newWorkout = await WorkoutServices.addWorkoutService({
      exerciseName,
      type,
      duration: Number(duration),
      reps: Number(reps),
      targetMuscleGroup,
      goalId,
      workoutDateAndTime: new Date(workoutDateAndTime),
      userId,
    });

    res
      .status(200)
      .json({ message: "Workout successfully added", newWorkout: newWorkout });
  } catch (err) {
    next(err);
  }
};

const deleteWorkoutController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const workoutId: string = req.params.id;
    await WorkoutServices.deleteWorkoutService(workoutId);
    res.status(200).json({ message: "Workout deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const updateWorkoutController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const updates = req.body;
    const workoutId = req.params.id;

    const updatedWorkout = await WorkoutServices.updateWorkoutService({
      userId,
      updates,
      workoutId,
    });

    res.status(200).json({
      message: "Goal updated successfully.",
      updatedWorkout: updatedWorkout,
    });
  } catch (err) {
    next(err);
  }
};

const getWorkoutSchedule = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const viewType = req.query.viewType ? req.query.viewType : "month";
    const offset = req.query.offset ? req.query.offset : 0;
    const particularDate = req.query.particularDate;

    const workoutsData = await WorkoutServices.getWorkoutScheduleService({
      userId,
      viewType,
      offset: Number(offset),
      particularDate,
    });

    res.status(200).json(workoutsData);
  } catch (err) {
    next(err);
  }
};

export {
  addWorkoutController,
  deleteWorkoutController,
  updateWorkoutController,
  getWorkoutSchedule,
};
