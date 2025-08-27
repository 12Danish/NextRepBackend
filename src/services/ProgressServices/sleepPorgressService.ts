import mongoose from "mongoose";
import SleepModel from "../../models/SleepModel";
import { Goal } from "../../models/GoalsModel";
import { Tracker } from "../../models/TrackerModel";
import CommonUtlis from "../commonUtils";

class SleepProgressServices {
  // Calculate progress for a specific sleep goal
  static async getSleepGoalProgressService(goalId: string) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw new Error("Invalid goal ID format");
    }

    // Fetch the sleep goal
    const goal = await Goal.findById(goalId);
    if (!goal) {
      throw new Error("Goal not found");
    }

    if (goal.category !== "sleep") {
      throw new Error("Goal is not a sleep goal");
    }

    const goalData = goal.data as any;
    const targetHours = goalData.targetHours || 8;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get sleep records for this goal from the start date onwards
    const sleepRecords = await SleepModel.find({
      goalId: new mongoose.Types.ObjectId(goalId),
      date: { $gte: goal.startDate }
    });

    // Also get tracker entries that reference sleep records for this goal
    // Don't filter by date since tracker entries might be for dates before goal creation
    const trackerEntries = await Tracker.aggregate([
      {
        $match: {
          type: "sleep"
        }
      },
      {
        $lookup: {
          from: "sleeps", // Collection name for Sleep model
          localField: "referenceId",
          foreignField: "_id",
          as: "sleepData"
        }
      },
      {
        $unwind: "$sleepData"
      },
      {
        $match: {
          "sleepData.goalId": new mongoose.Types.ObjectId(goalId)
        }
      },
      {
        $project: {
          date: "$date",
          duration: "$sleepHours"
        }
      }
    ]);

    // Combine both sources of sleep data
    const allSleepData = [
      ...sleepRecords.map(record => ({
        date: record.date,
        duration: record.duration
      })),
      ...trackerEntries.map(entry => ({
        date: entry.date,
        duration: entry.duration || 0
      }))
    ];



    if (allSleepData.length === 0) {
      return {
        goalId,
        progress: 0,
        message: "No sleep records found for this goal yet",
        currentHours: 0,
        targetHours: targetHours,
        unit: "hours"
      };
    }

    // Calculate total sleep hours achieved
    const totalSleepHours = allSleepData.reduce((sum, record) => sum + (record.duration || 0), 0);
    
    // Calculate progress based on daily target
    // For sleep goals, progress is based on how many days you've met your target
    const daysSinceStart = Math.ceil((today.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysWithSleepData = allSleepData.length;
    
    // Progress is based on how many days you've tracked sleep vs total days
    // But also consider if you're meeting your target hours
    let progress = 0;
    
    if (daysSinceStart > 0) {
      // Calculate progress based on days tracked and target hours met
      const daysMeetingTarget = allSleepData.filter(record => (record.duration || 0) >= targetHours).length;
      const trackingProgress = (daysWithSleepData / daysSinceStart) * 50; // 50% for tracking consistency
      const targetProgress = (daysMeetingTarget / daysSinceStart) * 50; // 50% for meeting target
      progress = Math.min(trackingProgress + targetProgress, 100);
    }

    return {
      goalId,
      progress: Math.round(progress * 100) / 100,
      message: "Sleep goal progress calculated successfully",
      currentHours: Math.round(totalSleepHours * 100) / 100,
      targetHours: targetHours,
      unit: "hours"
    };
  }

  static async getSleepGraphDataService({
    userId,
    viewType,
    particularDate,
  }: {
    userId: string;
    viewType: "day" | "week" | "month";
    particularDate?: Date;
  }) {
    // Calculate offset based on viewType to get previous period till today
    let offset = 0;
    if (viewType === "week" || viewType === "month") {
      offset = -1; // Previous 7 days for week or 30 days for month till today
    }

    const { start, end } =
      CommonUtlis.calculate_last_period_including_date_for_progress(
        viewType,
        offset,
        particularDate
      );

    // Get sleep data for the date range
    const sleepData = await SleepModel.aggregate([
      // Stage 1: Match sleep records in the date range for this user
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lt: end },
        },
      },

      // Stage 2: Add calculated fields for date formatting
      {
        $addFields: {
          // Extract date for grouping (YYYY-MM-DD format)
          dateOnly: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: "UTC",
            },
          },
        },
      },

      // Stage 3: Group by date (in case there are multiple records per day)
      {
        $group: {
          _id: "$dateOnly",
          date: { $first: "$dateOnly" },
          totalDuration: { $sum: "$duration" }, // Sum all sleep durations for the day
          sleepCount: { $sum: 1 }, // Count of sleep records
          averageDuration: { $avg: "$duration" }, // Average duration if multiple records
          goalId: { $first: "$goalId" }, // Keep goal reference
        },
      },

      // Stage 4: Sort by date
      {
        $sort: { date: 1 },
      },

      // Stage 5: Format the final output
      {
        $project: {
          _id: 0,
          date: 1,
          duration: { $round: ["$totalDuration", 2] }, // Total sleep duration for the day
          averageDuration: { $round: ["$averageDuration", 2] }, // Average if multiple records
          sleepCount: 1, // Number of sleep records for the day
          goalId: 1,
        },
      },
    ]);

    // Fill in missing dates with zero/null values for better graph continuity
    const filledResult = SleepProgressServices.fillMissingDatesForSleep(
      sleepData,
      start,
      end,
      viewType
    );

    return {
      message: "Sleep graph data retrieved successfully",
      data: filledResult,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        viewType,
      },
    };
  }

  // Helper method to fill missing dates for sleep data
  static fillMissingDatesForSleep(
    data: any[],
    startDate: Date,
    endDate: Date,
    viewType: string
  ) {
    const filledData = [];
    const current = new Date(startDate);

    while (current < endDate) {
      const dateStr = current.toISOString().split("T")[0]; // YYYY-MM-DD

      // Find existing data for this date
      const existingData = data.find((item) => item.date === dateStr);

      if (existingData) {
        filledData.push(existingData);
      } else {
        // Add empty data for missing dates
        filledData.push({
          date: dateStr,
          duration: 0, // No sleep recorded
          averageDuration: 0,
          sleepCount: 0,
          goalId: null,
        });
      }

      // Move to next day
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return filledData;
  }
}

export { SleepProgressServices };
