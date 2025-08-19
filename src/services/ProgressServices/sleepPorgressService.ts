import mongoose from "mongoose";
import SleepModel from "../../models/SleepModel";
import CommonUtlis from "../commonUtils";
class SleepProgressServices {
  static async getSleepGraphDataService({
    userId,
    viewType,
  }: {
    userId: string;
    viewType: "day" | "week" | "month";
  }) {
    // Calculate offset based on viewType to get previous period till today
    let offset = 0;
    if (viewType === "week" || viewType === "month") {
      offset = -1; // Previous 7 days for week or 30 days for month till today
    }

    const { start, end } =
      CommonUtlis.calculate_last_period_including_date_for_progress(
        viewType,
        offset
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
