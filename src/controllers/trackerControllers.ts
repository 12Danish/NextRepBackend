import { NextFunction, Request, Response } from "express";
import TrackerServices from "../services/trackerServices";
import jwt from "jsonwebtoken";

const getScheduleController = async (
  req: Request,
  res: any,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const date = req.query.date as string;

    const scheduledData = await TrackerServices.getScheduleService({
      date,
      userId,
    });

    res.status(200).json({
      message: "Successfully retrieved Scheduled Data for the provided date",
      scheduledData,
    });
  } catch (err) {
    next(err);
  }
};

const addTrackerController = async (
  req: Request,
  res: any,
  next: NextFunction
) => {
  try {
    // Your logic here
  } catch (err) {
    next(err);
  }
};

const updateTrackerController = async (
  req: Request,
  res: any,
  next: NextFunction
) => {
  try {
    // Your logic here
  } catch (err) {
    next(err);
  }
};

const deleteTrackerController = async (
  req: Request,
  res: any,
  next: NextFunction
) => {
  try {
    // Your logic here
  } catch (err) {
    next(err);
  }
};

export {
  deleteTrackerController,
  addTrackerController,
  updateTrackerController,
  getScheduleController,
};
