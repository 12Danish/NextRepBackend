import { NextFunction, Request, Response } from "express";
import TrackerServices from "../services/trackerServices";
import jwt from "jsonwebtoken";

const getTrackedController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const date = new Date(req.query.date as string);

    const trackedData = await TrackerServices.getTrackedService({
      date,
      userId,
    });

    res.status(200).json({
      message: "Successfully retrieved tracked data for the provided date",
      trackedData,
    });
  } catch (err) {
    next(err);
  }
};

const addTrackerController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const type = req.body.type as "sleep" | "workout" | "diet";
    const refId = req.params.referenceId;
    const date = new Date(req.body.date); // ensure it's a Date
    const workoutOrDietData = req.body.workoutOrDietData || {};

    const newTracker = await TrackerServices.addTrackerService({
      userId,
      type,
      refId,
      date,
      workoutOrDietData,
    });

    res.status(201).json({
      message: "Tracker successfully added",
      newTracker,
    });
  } catch (err) {
    next(err);
  }
};

const updateTrackerController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const trackerId = req.params.trackerId;
    const updates = req.body.updates || {};

    const updatedTracker = await TrackerServices.updateTrackerService({
      trackerId,
      updates,
    });

    res.status(200).json({
      message: "Tracker updated successfully",
      updatedTracker,
    });
  } catch (err) {
    next(err);
  }
};

const deleteTrackerController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const trackerId = req.params.trackerId;

    await TrackerServices.deleteTrackerService(trackerId);

    res.status(200).json({ message: "Tracked value successfully deleted" });
  } catch (err) {
    next(err);
  }
};

export {
  deleteTrackerController,
  addTrackerController,
  updateTrackerController,
  getTrackedController,
};
