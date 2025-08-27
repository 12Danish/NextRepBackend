import mongoose from "mongoose";
import { Goal } from "../../models/GoalsModel";
import { CustomError } from "../../utils/customError";
import { Workout } from "../../models/WorkoutModel";
import { Tracker } from "../../models/TrackerModel";
import CommonUtlis from "../commonUtils";
class WorkoutProgressServices {
  // Calculating WorkoutGoal Progress
  static async getWorkoutGoalProgressService(goalId: string) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw new CustomError("Invalid goal ID", 400);
    }

    const workoutGoal = await Goal.findById(goalId);

    if (!workoutGoal) {
      throw new CustomError("Specified Workout Goal does not exist", 404);
    }

    if (workoutGoal.category !== "workout") {
      throw new CustomError("Category must be workout", 400);
    }

    // Calculate goal duration in days
    const goalDurationMs =
      workoutGoal.targetDate.getTime() - workoutGoal.startDate.getTime();
    const goalDurationDays = Math.ceil(goalDurationMs / (1000 * 60 * 60 * 24));

    if (goalDurationDays <= 0) {
      throw new CustomError("Invalid goal duration", 400);
    }

    // Get all scheduled workouts for this goal
    const mappedScheduledWorkouts = await Workout.find({
      goalId: workoutGoal._id,
    });

    if (!mappedScheduledWorkouts || mappedScheduledWorkouts.length === 0) {
      return {
        message: "No workout has been scheduled with reference to this goal",
        progress: {},
      };
    }

    // Get workout IDs for tracker lookup
    const workoutIds = mappedScheduledWorkouts.map((workout) => workout._id);

    // Find all tracker entries for these workouts
    const trackerEntries = await Tracker.find({
      type: "workout",
      referenceId: { $in: workoutIds },
    });

    if (!trackerEntries || trackerEntries.length === 0) {
      return {
        message: "No tracking data found for scheduled workouts",
        progress: {},
      };
    }

    console.log("These are the trackers");
    console.log(trackerEntries);

    // Calculate actual workout duration using aggregation
    const actualWorkoutData = await Tracker.aggregate([
      {
        $match: {
          type: "workout",
          referenceId: { $in: workoutIds },
        },
      },
      {
        $lookup: {
          from: "workouts",
          let: { refId: { $toObjectId: "$referenceId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$refId"] } } }],
          as: "workoutInfo",
        },
      },
      {
        $unwind: "$workoutInfo",
      },
      {
        $group: {
          _id: null,
          totalCompletedMinutes: {
            $sum: {
              $ifNull: ["$completedTime", 0],
            },
          },
          totalScheduledMinutes: {
            $sum: {
              $ifNull: ["$workoutInfo.duration", 0],
            },
          },
          workoutCount: { $sum: 1 },
          // Get unique workout days count
          uniqueDaysTracked: {
            $addToSet: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
        },
      },
      {
        $addFields: {
          totalTrackedDays: { $size: "$uniqueDaysTracked" },
        },
      },
    ]);

    console.log("This is the workout data calculated");
    console.log(actualWorkoutData);

    // If no workout data found
    if (!actualWorkoutData || actualWorkoutData.length === 0) {
      return {
        message: "No workout data calculated",
        progress: {},
      };
    }

    const workoutData = actualWorkoutData[0];
    const goalData = workoutGoal.data;

    // Calculate total target values based on goal duration
    // The target values in goalData are per day, so multiply by goal duration
    const dailyTargetMinutes = goalData.targetMinutes || 0;
    const totalTargetMinutes = dailyTargetMinutes * goalDurationDays;

    // Calculate progress percentages
    const calculateProgress = (actual: number, target: number): number => {
      if (target === 0) return 0;
      return Math.round((actual / target) * 100 * 100) / 100; // Round to 2 decimal places
    };

    const actualMinutes = workoutData.totalCompletedMinutes || 0;
    const trackedDaysCount = workoutData.totalTrackedDays || 0;

    const progress = {
      goalInfo: {
        exerciseName: goalData.exerciseName,
        duration: goalDurationDays,
        startDate: workoutGoal.startDate,
        targetDate: workoutGoal.targetDate,
        trackedDays: trackedDaysCount,
        dailyTarget: {
          minutes: dailyTargetMinutes,
        },
      },
      duration: {
        target: totalTargetMinutes,
        actual: Math.round(actualMinutes * 100) / 100,
        progress: calculateProgress(actualMinutes, totalTargetMinutes),
        status:
          actualMinutes >= totalTargetMinutes ? "completed" : "in_progress",
        dailyAverage:
          trackedDaysCount > 0
            ? Math.round((actualMinutes / trackedDaysCount) * 100) / 100
            : 0,
      },
      workoutSessions: {
        completed: workoutData.workoutCount,
        scheduledMinutes: workoutData.totalScheduledMinutes,
        completedMinutes: actualMinutes,
        averageSessionDuration:
          workoutData.workoutCount > 0
            ? Math.round((actualMinutes / workoutData.workoutCount) * 100) / 100
            : 0,
      },
      overall: {
        completionRate: calculateProgress(actualMinutes, totalTargetMinutes),
        dayCompletionRate:
          Math.round((trackedDaysCount / goalDurationDays) * 100 * 100) / 100,
        status:
          actualMinutes >= totalTargetMinutes
            ? "goal_achieved"
            : "working_towards_goal",
        onTrackForDaily:
          trackedDaysCount > 0
            ? actualMinutes / trackedDaysCount >= dailyTargetMinutes
              ? "on_track"
              : "behind_target"
            : "no_data",
      },
    };

    return {
      message: "Workout goal progress calculated successfully",
      progress,
    };
  }
  // Get Workout Graph Progress Service (similar to diet)
  static async getWorkoutGraphProgressService({
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
    if (viewType === "week" || viewType == "month") {
      offset = -1; // Previous 7 days for week or 30 days for month till today
    }
    const { start, end } =
      CommonUtlis.calculate_last_period_including_date_for_progress(
        viewType,
        offset,
        particularDate
      );

    // Adding tests to see why progress is failing
    // ******************
    const baseMatch = {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        workoutDateAndTime: { $gte: start, $lt: end },
      },
    };

    // Use aggregation pipeline to get scheduled and tracked workout data
    // Use aggregation pipeline to get scheduled and tracked workout data
    const result = await Workout.aggregate([
      // Stage 1: Match workouts in the date range for this user
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          workoutDateAndTime: { $gte: start, $lt: end },
        },
      },

      // Stage 2: Lookup corresponding tracker entries (FIXED)
      {
        $lookup: {
          from: "trackers", // Tracker collection name
          let: { workoutId: "$_id" }, // Store current workout's _id in variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$referenceId", "$$workoutId"] }, // FIXED: Use $$workoutId (double $)
                    { $eq: ["$type", "workout"] }, // Only workout trackers
                  ],
                },
              },
            },
          ],
          as: "trackerInfo",
        },
      },

      // Stage 3: Add calculated fields for scheduled and actual workout data (COMPLETE DEFINITIONS)
      {
        $addFields: {
          // Extract date for grouping (YYYY-MM-DD format)
          dateOnly: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$workoutDateAndTime",
              timezone: "UTC",
            },
          },

          // Scheduled duration (what was planned)
          scheduledDuration: { $ifNull: ["$duration", 0] },

          // Actual duration (what was completed)
          actualDuration: {
            $cond: {
              if: { $gt: [{ $size: "$trackerInfo" }, 0] },
              then: {
                $ifNull: [
                  { $arrayElemAt: ["$trackerInfo.completedTime", 0] },
                  0,
                ],
              },
              else: 0,
            },
          },

          // Check if workout was tracked
          isTracked: {
            $cond: {
              if: { $gt: [{ $size: "$trackerInfo" }, 0] },
              then: 1,
              else: 0,
            },
          },

          // Workout details for grouping
          workoutType: "$type",
          exerciseName: "$exerciseName",
          targetMuscleGroup: "$targetMuscleGroup",
        },
      },

      // Stage 4: Group by date and aggregate workout data (FIXED)
      {
        $group: {
          _id: "$dateOnly", // Group by date
          date: { $first: "$dateOnly" },

          // Sum scheduled and actual durations for the day
          totalScheduledDuration: { $sum: "$scheduledDuration" },
          totalActualDuration: { $sum: "$actualDuration" },

          // Count workouts
          totalWorkouts: { $sum: 1 },
          trackedWorkouts: { $sum: "$isTracked" },

          // Track workout details
          workoutDetails: {
            $push: {
              exerciseName: "$exerciseName",
              type: "$workoutType",
              targetMuscleGroup: "$targetMuscleGroup",
              scheduledDuration: "$scheduledDuration",
              actualDuration: "$actualDuration",
              isTracked: "$isTracked",
            },
          },

          // Track unique workout types and muscle groups
          workoutTypes: { $addToSet: "$workoutType" },
          targetMuscleGroups: { $push: "$targetMuscleGroup" }, // FIXED: Use $push instead of $addToSet

          // Track if any workouts were completed on this day
          hasTracking: {
            $max: "$isTracked",
          },
        },
      },

      // Stage 5: Sort by date
      {
        $sort: { date: 1 },
      },

      // Stage 6: Format the final output (FIXED targetMuscleGroups)
      {
        $project: {
          _id: 0,
          date: 1,
          scheduled: {
            totalDuration: { $round: ["$totalScheduledDuration", 2] },
            workoutCount: "$totalWorkouts",
          },
          actual: {
            totalDuration: {
              $cond: [
                { $eq: ["$hasTracking", 1] },
                { $round: ["$totalActualDuration", 2] },
                null,
              ],
            },
            completedWorkouts: "$trackedWorkouts",
          },
          adherence: {
            durationAdherence: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$hasTracking", 1] },
                    { $gt: ["$totalScheduledDuration", 0] },
                  ],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$totalActualDuration",
                            "$totalScheduledDuration",
                          ],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                null,
              ],
            },
            workoutCompletion: {
              $cond: [
                { $gt: ["$totalWorkouts", 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: ["$trackedWorkouts", "$totalWorkouts"],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },
          },
          workoutSummary: {
            types: "$workoutTypes",
            targetMuscleGroups: {
              $reduce: {
                input: {
                  $reduce: {
                    input: "$targetMuscleGroups",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
                },
                initialValue: [],
                in: {
                  $cond: {
                    if: { $in: ["$$this", "$$value"] },
                    then: "$$value",
                    else: { $concatArrays: ["$$value", ["$$this"]] },
                  },
                },
              },
            },
            details: "$workoutDetails",
          },
        },
      },
    ]);
    // Fill in missing dates with zero values for better graph continuity
    const filledResult = WorkoutProgressServices.fillMissingDatesForWorkout(
      result,
      start,
      end,
      viewType
    );

    return {
      message: "Workout graph progress retrieved successfully",
      data: filledResult,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        viewType,
      },
    };
  }

  // Helper method to fill missing dates for workouts
  static fillMissingDatesForWorkout(
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
          scheduled: {
            totalDuration: 0,
            workoutCount: 0,
          },
          actual: {
            totalDuration: null,
            completedWorkouts: 0,
          },
          adherence: {
            durationAdherence: null,
            workoutCompletion: 0,
          },
          workoutSummary: {
            types: [],
            targetMuscleGroups: [],
            details: [],
          },
        });
      }

      // Move to next day
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return filledData;
  }
}

export { WorkoutProgressServices };
