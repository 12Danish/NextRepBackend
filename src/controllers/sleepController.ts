import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import SleepServices from "../services/sleepService";

/**
 * @desc    Create a new sleep entry for the authenticated user
 * @route   POST /api/sleep
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @body
 * {
 *   "startTime": "Date",   // Required - Sleep start time
 *   "endTime": "Date",     // Required - Sleep end time
 *   "quality": "string",   // Optional - e.g., "good", "poor"
 *   "notes": "string"      // Optional - additional notes
 * }
 *
 * @returns
 * {
 *   "message": "Sleep entry created successfully",
 *   "data": { ...newSleep }
 * }
 *
 * @errors
 * - 400 if required fields are missing
 * - 500 in case of unexpected error
 */
const createSleepController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const sleepData = { ...req.body, userId };

    const newSleep = await SleepServices.createSleepService(sleepData);

    res.status(200).json({
      message: "Sleep entry created successfully",
      data: newSleep,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get sleep entries for the authenticated user
 * @route   GET /api/sleep
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @query
 * viewType (string)  - "day", "week", or "month" (default "day")
 * offset (number)    - Offset from the current period, e.g., -1 for previous, 1 for next (default 0)
 *
 * @returns
 * {
 *   "message": "Sleep entries retrieved successfully",
 *   "data": [ ...sleepEntries ]
 * }
 *
 * @errors
 * - 500 in case of unexpected error
 */
const getSleepController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const viewType = req.query.viewType ? req.query.viewType : "day";
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const sleepEntries = await SleepServices.getSleepService({
      userId,
      viewType,
      offset,
    });

    res.status(200).json({
      message: "Sleep entries retrieved successfully",
      data: sleepEntries,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a sleep entry
 * @route   PATCH /api/sleep/:sleepId
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * @params
 * sleepId (string) - ID of the sleep entry
 *
 * @body
 * {
 *   "fieldToUpdate": "value"
 * }
 *
 * @returns
 * {
 *   "message": "Sleep entry updated successfully",
 *   "data": { ...updatedSleep }
 * }
 *
 * @errors
 * - 404 if no entry found with given ID
 * - 500 in case of unexpected error
 */
const updateSleepController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sleepId = req.params.sleepId;
    const updates = req.body;

    const updatedSleep = await SleepServices.updateSleepService(
      sleepId,
      updates
    );

    res.status(200).json({
      message: "Sleep entry updated successfully",
      data: updatedSleep,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a sleep entry
 * @route   DELETE /api/sleep/:sleepId
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @params
 * sleepId (string) - ID of the sleep entry
 *
 * @returns
 * {
 *   "message": "Sleep entry deleted successfully"
 * }
 *
 * @errors
 * - 404 if no entry found with given ID
 * - 500 in case of unexpected error
 */
const deleteSleepController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sleepId = req.params.sleepId;

    await SleepServices.deleteSleepService(sleepId);

    res.status(200).json({
      message: "Sleep entry deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export {
  createSleepController,
  getSleepController,
  updateSleepController,
  deleteSleepController,
};
