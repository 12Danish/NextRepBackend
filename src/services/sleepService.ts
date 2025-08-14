import mongoose from "mongoose";
import Sleep, { ISleep } from "../models/SleepModel";
import { CustomError } from "../utils/customError";
import CommonUtlis, { getScheduleServiceProps } from "./commonUtils";

interface SleepInput {
  userId: string;
  duration: number;
  date: Date;
  goalId: string;
}

class SleepServices {
  /**
   * Creates a new sleep entry for a user
   */
  static async createSleepService(sleepInput: SleepInput): Promise<ISleep> {
    const { userId, duration, date, goalId } = sleepInput;
    if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
      throw new CustomError("Invalid goal ID", 400);
    }
    const sleep = await Sleep.create({ userId, duration, date, goalId });
    return sleep;
  }

  static async getSleepService({
    userId,
    viewType,
    offset,
    particularDate,
  }: getScheduleServiceProps) {
    // Calculate start & end dates based on params
    const { start, end } = CommonUtlis.calculate_start_and_end_dates(
      viewType,
      offset,
      particularDate ? new Date(particularDate) : undefined
    );

    // Get sleep entries in the range
    const sleepEntries = await Sleep.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    // Check if there’s any sleep data before this range
    const hasPrev = await Sleep.exists({
      userId,
      date: { $lt: start },
    });

    // Check if there’s any sleep data after this range
    const hasNext = await Sleep.exists({
      userId,
      date: { $gt: end },
    });

    return {
      start,
      end,
      count: sleepEntries.length,
      sleepEntries,
      prev: Boolean(hasPrev),
      next: Boolean(hasNext),
    };
  }

  /**
   * Updates a sleep entry by id
   */
  static async updateSleepService(
    sleepId: string,
    sleepInput: SleepInput
  ): Promise<ISleep> {
    if (!mongoose.Types.ObjectId.isValid(sleepId)) {
      throw new CustomError("Invalid sleep ID", 400);
    }
    const sleep = await Sleep.findByIdAndUpdate(sleepId, sleepInput, {
      new: true,
    });
    if (!sleep) {
      throw new CustomError("Sleep entry not found", 404);
    }
    return sleep;
  }

  /**
   * Deletes a sleep entry by id
   */
  static async deleteSleepService(sleepId: string): Promise<ISleep> {
    if (!mongoose.Types.ObjectId.isValid(sleepId)) {
      throw new CustomError("Invalid sleep ID", 400);
    }
    const sleep = await Sleep.findByIdAndDelete(sleepId);
    if (!sleep) {
      throw new CustomError("Sleep entry not found", 404);
    }
    return sleep;
  }
}
export default SleepServices;
