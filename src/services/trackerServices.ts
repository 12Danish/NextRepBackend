import { Workout } from "../models/WorkoutModel";
import SleepModel from "../models/SleepModel";
import { Diet } from "../models/DietModel";
import { Tracker } from "../models/TrackerModel";
import { CustomError } from "../utils/customError";
import mongoose from "mongoose";

interface AddTrackerServiceDietOrWorkoutDataProps {
  weightConsumed?: number;
  completedReps?: number;
  completedTime?: number;
}

class TrackerServices {
  static async getTrackedService({ date, userId }: { date:  Date; userId: string }) {
    const givenDate = new Date(date);

    const startOfDay = new Date(givenDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(givenDate.setHours(23, 59, 59, 999));

    return await Tracker.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ date: 1 });
  }

  /**
   * Get comprehensive tracking data for a date range including original entries and tracker data
   */
  static async getComprehensiveTrackingService({ 
    startDate, 
    endDate, 
    userId 
  }: { 
    startDate: Date; 
    endDate: Date; 
    userId: string 
  }) {
    // Get all tracker entries for the user (not limited by date since we want to match with original entries)
    const trackerEntries = await Tracker.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ date: 1 });

    // Get all diet entries for the date range
    const dietEntries = await Diet.find({
      userId: new mongoose.Types.ObjectId(userId),
      mealDateAndTime: { $gte: startDate, $lt: endDate },
    }).sort({ mealDateAndTime: 1 });

    // Get all workout entries for the date range
    const workoutEntries = await Workout.find({
      userId: new mongoose.Types.ObjectId(userId),
      workoutDateAndTime: { $gte: startDate, $lt: endDate },
    }).sort({ workoutDateAndTime: 1 });

    // Get all sleep entries for the date range
    const sleepEntries = await SleepModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: 1 });

    // Group by date and match tracker data
    const groupedData: any = {};

    // Process diet entries
    dietEntries.forEach((diet: any) => {
      const dateStr = diet.mealDateAndTime.toISOString().split('T')[0];
      if (!groupedData[dateStr]) groupedData[dateStr] = [];
      
      // Find tracker by referenceId, not by date
      const tracker = trackerEntries.find(t => 
        t.type === 'diet' && 
        t.referenceId.toString() === (diet._id as any).toString()
      );

      groupedData[dateStr].push({
        type: 'diet',
        data: diet,
        tracker: tracker || null
      });
    });

    // Process workout entries
    workoutEntries.forEach((workout: any) => {
      const dateStr = workout.workoutDateAndTime.toISOString().split('T')[0];
      if (!groupedData[dateStr]) groupedData[dateStr] = [];
      
      // Find tracker by referenceId, not by date
      const tracker = trackerEntries.find(t => 
        t.type === 'workout' && 
        t.referenceId.toString() === (workout._id as any).toString()
      );

      groupedData[dateStr].push({
        type: 'workout',
        data: workout,
        tracker: tracker || null
      });
    });

    // Process sleep entries
    sleepEntries.forEach((sleep: any) => {
      const dateStr = sleep.date.toISOString().split('T')[0];
      if (!groupedData[dateStr]) groupedData[dateStr] = [];
      
      // Find tracker by referenceId, not by date
      const tracker = trackerEntries.find(t => 
        t.type === 'sleep' && 
        t.referenceId.toString() === (sleep._id as any).toString()
      );

      groupedData[dateStr].push({
        type: 'sleep',
        data: sleep,
        tracker: tracker || null
      });
    });

    return groupedData;
  }

  static async addTrackerService({
    userId,
    type,
    refId,
    date,
    workoutOrDietData,
  }: {
    userId: string;
    type: "sleep" | "workout" | "diet";
    refId: string;
    date: Date;
    workoutOrDietData: AddTrackerServiceDietOrWorkoutDataProps;
  }) {
    if (!mongoose.Types.ObjectId.isValid(refId)) {
      throw new CustomError("Invalid reference ID", 400);
    }

    let newTracker;

    switch (type) {
      case "sleep": {
        const sleepEntry = await SleepModel.findById(refId);
        if (!sleepEntry) throw new CustomError("No sleep entry found", 404);

        newTracker = await Tracker.create({
          userId: new mongoose.Types.ObjectId(userId),
          date,
          type: "sleep",
          referenceId: new mongoose.Types.ObjectId(refId),
        });
        break;
      }

      case "workout": {
        const workoutEntry = await Workout.findById(refId);
        if (!workoutEntry) throw new CustomError("Workout not found", 404);

        newTracker = await Tracker.create({
          userId: new mongoose.Types.ObjectId(userId),
          date,
          type: "workout",
          referenceId: new mongoose.Types.ObjectId(refId),
          completedReps: Number(workoutOrDietData.completedReps) || null,
          completedTime: Number(workoutOrDietData.completedTime) || null,
        });
        break;
      }

      case "diet": {
        const dietEntry = await Diet.findById(refId);
        if (!dietEntry) throw new CustomError("Diet not found", 404);

        newTracker = await Tracker.create({
          userId: new mongoose.Types.ObjectId(userId),
          date,
          type: "diet",
          referenceId: new mongoose.Types.ObjectId(refId),
          weightConsumed: workoutOrDietData.weightConsumed ?? null,
        });
        break;
      }

      default:
        throw new CustomError("Invalid tracker type", 400);
    }

    return newTracker;
  }

  static async deleteTrackerService(trackerId: string) {
    if (!mongoose.Types.ObjectId.isValid(trackerId)) {
      throw new CustomError("Invalid tracker ID", 400);
    }
    await Tracker.findByIdAndDelete(trackerId);
    return true;
  }

  static async updateTrackerService({
    trackerId,
    updates,
  }: {
    trackerId: string;
    updates: Partial<{
      type: "sleep" | "workout" | "diet";
      refId: string;
      date: Date;
      completedReps: number;
      completedTime: number;
      weightConsumed: number;
    }>;
  }) {
    if (!mongoose.Types.ObjectId.isValid(trackerId)) {
      throw new CustomError("Invalid tracker ID", 400);
    }

    return await Tracker.findByIdAndUpdate(trackerId, updates, { new: true });
  }
}

export default TrackerServices;
