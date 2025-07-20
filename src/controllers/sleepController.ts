import { Request, Response, NextFunction } from "express";
import SleepServices from "../services/sleepService";
import { CustomError } from "../utils/customError";

// Async error handler wrapper
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
const asyncHandler = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create new sleep entry
export const createSleepController = asyncHandler(async (req: Request, res: Response) => {
  const sleepData = req.body;
  
  const newSleep = await SleepServices.createSleepService(sleepData);
  
  res.status(201).json({
    success: true,
    message: "Sleep entry created successfully",
    data: newSleep
  });
});

// Get sleep entries for a user
export const getSleepController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const sleepEntries = await SleepServices.getSleepService(userId);
  
  res.status(200).json({
    success: true,
    message: "Sleep entries retrieved successfully",
    data: sleepEntries
  });
});

// Get specific sleep entry by ID
export const getSleepByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { sleepId } = req.params;
  
  const sleep = await SleepServices.getSleepByIdService(sleepId);
  
  res.status(200).json({
    success: true,
    message: "Sleep entry retrieved successfully",
    data: sleep
  });
});

// Update sleep entry
export const updateSleepController = asyncHandler(async (req: Request, res: Response) => {
  const { sleepId } = req.params;
  const updates = req.body;
  
  const updatedSleep = await SleepServices.updateSleepService(sleepId, updates);
  
  res.status(200).json({
    success: true,
    message: "Sleep entry updated successfully",
    data: updatedSleep
  });
});

// Delete sleep entry
export const deleteSleepController = asyncHandler(async (req: Request, res: Response) => {
  const { sleepId } = req.params;
  
  const deletedSleep = await SleepServices.deleteSleepService(sleepId);
  
  res.status(200).json({
    success: true,
    message: "Sleep entry deleted successfully",
    data: deletedSleep
  });
});

// Get sleep entry by date
export const getSleepByDateController = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.params;
  
  const sleepEntry = await SleepServices.getSleepByDateService(new Date(date));
  
  res.status(200).json({
    success: true,
    message: "Sleep entry for date retrieved successfully",
    data: sleepEntry
  });
});

// Get sleep stats for a user
export const getSleepStatsController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const stats = await SleepServices.getSleepStatsService(userId);
  
  res.status(200).json({
    success: true,
    message: "Sleep statistics retrieved successfully",
    data: stats
  });
});

// Create multiple sleep records
export const createMultipleSleepController = asyncHandler(async (req: Request, res: Response) => {
  const sleepDataArray = req.body;
  
  const newSleepEntries = await SleepServices.createMultipleSleepService(sleepDataArray);
  
  res.status(201).json({
    success: true,
    message: "Multiple sleep entries created successfully",
    data: newSleepEntries,
    count: newSleepEntries.length
  });
});

// Get all sleep entries for a specific user (alias for getSleepController)
export const getAllSleepController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const sleepEntries = await SleepServices.getSleepService(userId);
  
  res.status(200).json({
    success: true,
    message: "All sleep entries retrieved successfully",
    data: sleepEntries
  });
});

