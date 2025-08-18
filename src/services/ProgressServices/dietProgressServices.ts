import { Diet } from "../../models/DietModel";
import { Tracker } from "../../models/TrackerModel";
import { Workout } from "../../models/WorkoutModel";
import { Goal } from "../../models/GoalsModel";
import SleepModel from "../../models/SleepModel";
import mongoose from "mongoose";
import { CustomError } from "../../utils/customError";
import CommonUtlis from "../commonUtils";

class DietProgressServices {
  // Calculating DietGoal Progress
  static async getDietGoalProgressService(goalId: string) {
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw new CustomError("Invalid goal ID", 400);
    }

    const dietGoal = await Goal.findById(goalId);

    if (!dietGoal) {
      throw new CustomError("Specified Diet Goal does not exist", 404);
    }

    if (dietGoal.category !== "diet") {
      throw new CustomError("Category must be diet", 400);
    }

    // Get all scheduled diets for this goal
    const mappedScheduledDiets = await Diet.find({ goalId: dietGoal._id });

    if (!mappedScheduledDiets || mappedScheduledDiets.length === 0) {
      return {
        message: "No diet has been scheduled with reference to this goal",
        progress: {},
      };
    }

    // Get diet IDs for tracker lookup
    const dietIds = mappedScheduledDiets.map((diet) => diet._id);

    // Find all tracker entries for these diets
    const trackerEntries = await Tracker.find({
      type: "diet",
      referenceId: { $in: dietIds },
    });

    if (!trackerEntries || trackerEntries.length === 0) {
      return {
        message: "No tracking data found for scheduled diets",
        progress: {},
      };
    }

    console.log("These are the trackers");
    console.log(trackerEntries);

    // Calculate actual consumption using aggregation
    const actualConsumption = await Tracker.aggregate([
      {
        $match: {
          type: "diet",
          referenceId: { $in: dietIds },
        },
      },
      {
        $lookup: {
          from: "diets",
          let: { refId: { $toObjectId: "$referenceId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$refId"] } } }],
          as: "dietInfo",
        },
      },
      {
        $unwind: "$dietInfo",
      },
      {
        $addFields: {
          // Calculate actual consumed nutrients based on weight ratio
          consumptionRatio: {
            $cond: {
              if: { $gt: ["$dietInfo.mealWeight", 0] },
              then: { $divide: ["$weightConsumed", "$dietInfo.mealWeight"] },
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCalories: {
            $sum: {
              $multiply: ["$dietInfo.calories", "$consumptionRatio"],
            },
          },
          totalProteins: {
            $sum: {
              $multiply: ["$dietInfo.protein", "$consumptionRatio"],
            },
          },
          totalFats: {
            $sum: {
              $multiply: ["$dietInfo.fat", "$consumptionRatio"],
            },
          },
          totalCarbs: {
            $sum: {
              $multiply: ["$dietInfo.carbs", "$consumptionRatio"],
            },
          },
        },
      },
    ]);

    console.log("This is the consumption calculated");
    console.log(actualConsumption);

    // If no consumption data found
    if (!actualConsumption || actualConsumption.length === 0) {
      return {
        message: "No consumption data calculated",
        progress: {},
      };
    }

    const consumption = actualConsumption[0];
    const goalData = dietGoal.data;

    // Calculate progress percentages (can be negative if overconsumption)
    const calculateProgress = (actual: number, target: number): number => {
      if (target === 0) return 0;
      return Math.round((actual / target) * 100 * 100) / 100; // Round to 2 decimal places
    };

    const progress = {
      calories: {
        target: goalData.targetCalories,
        actual: Math.round(consumption.totalCalories * 100) / 100,
        progress: calculateProgress(
          consumption.totalCalories,
          goalData.targetCalories
        ),
        status:
          consumption.totalCalories <= goalData.targetCalories
            ? "on_track"
            : "exceeded",
      },
      proteins: {
        target: goalData.targetProteins,
        actual: Math.round(consumption.totalProteins * 100) / 100,
        progress: calculateProgress(
          consumption.totalProteins,
          goalData.targetProteins
        ),
        status:
          consumption.totalProteins <= goalData.targetProteins
            ? "on_track"
            : "exceeded",
      },
      fats: {
        target: goalData.targetFats,
        actual: Math.round(consumption.totalFats * 100) / 100,
        progress: calculateProgress(consumption.totalFats, goalData.targetFats),
        status:
          consumption.totalFats <= goalData.targetFats
            ? "on_track"
            : "exceeded",
      },
      carbs: {
        target: goalData.targetCarbs,
        actual: Math.round(consumption.totalCarbs * 100) / 100,
        progress: calculateProgress(
          consumption.totalCarbs,
          goalData.targetCarbs
        ),
        status:
          consumption.totalCarbs <= goalData.targetCarbs
            ? "on_track"
            : "exceeded",
      },
      overall: {
        averageProgress:
          Math.round(
            ((calculateProgress(
              consumption.totalCalories,
              goalData.targetCalories
            ) +
              calculateProgress(
                consumption.totalProteins,
                goalData.targetProteins
              ) +
              calculateProgress(consumption.totalFats, goalData.targetFats) +
              calculateProgress(consumption.totalCarbs, goalData.targetCarbs)) /
              4) *
              100
          ) / 100,
      },
    };

    return {
      message: "Diet goal progress calculated successfully",
      progress,
    };
  }

  static async getDietGraphProgressService({
    userId,
    viewType,
  }: {
    userId: string;
    viewType: "day" | "week" | "month";
  }) {
    // Calculate offset based on viewType to get previous period till today
    let offset = 0;
    if (viewType === "week" || viewType == "month") {
      offset = -1; // Previous 7 days for week or 30 days for month till today
    }
    const { start, end } =
      CommonUtlis.calculate_last_period_including_date_for_progress(
        viewType,
        offset
      );

    // Use aggregation pipeline to get scheduled and tracked data
    const result = await Diet.aggregate([
      // Stage 1: Match diets in the date range for this user
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          mealDateAndTime: { $gte: start, $lt: end },
        },
      },

      // Stage 2: Lookup corresponding tracker entries
      {
        $lookup: {
          from: "trackers", // Tracker collection name
          let: { dietId: "$_id" }, // Store current diet's _id in variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$referenceId", "$$dietId"] }, // Match referenceId with dietId
                    { $eq: ["$type", "diet"] }, // Only diet trackers
                  ],
                },
              },
            },
          ],
          as: "trackerInfo",
        },
      },

      // Stage 3: Add calculated fields for scheduled and actual consumption
      {
        $addFields: {
          // Extract date for grouping (YYYY-MM-DD format)
          dateOnly: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$mealDateAndTime",
              timezone: "UTC",
            },
          },

          // Calculate actual consumption ratio
          actualConsumptionRatio: {
            $cond: {
              if: { $gt: [{ $size: "$trackerInfo" }, 0] }, // If tracker exists
              then: {
                $cond: {
                  if: { $gt: ["$mealWeight", 0] }, // Avoid division by zero
                  then: {
                    $divide: [
                      { $arrayElemAt: ["$trackerInfo.weightConsumed", 0] },
                      "$mealWeight",
                    ],
                  },
                  else: 0,
                },
              },
              else: 0, // No tracking data
            },
          },

          // Scheduled nutrients (what was planned)
          scheduledCalories: "$calories",
          scheduledProteins: "$protein",
          scheduledFats: "$fat",
          scheduledCarbs: "$carbs",

          // Actual nutrients (what was consumed)
          actualCalories: {
            $cond: {
              if: { $gt: [{ $size: "$trackerInfo" }, 0] },
              then: {
                $multiply: [
                  "$calories",
                  {
                    $cond: {
                      if: { $gt: ["$mealWeight", 0] },
                      then: {
                        $divide: [
                          { $arrayElemAt: ["$trackerInfo.weightConsumed", 0] },
                          "$mealWeight",
                        ],
                      },
                      else: 0,
                    },
                  },
                ],
              },
              else: 0,
            },
          },

          actualProteins: {
            $cond: {
              if: { $gt: [{ $size: "$trackerInfo" }, 0] },
              then: {
                $multiply: [
                  "$protein",
                  {
                    $cond: {
                      if: { $gt: ["$mealWeight", 0] },
                      then: {
                        $divide: [
                          { $arrayElemAt: ["$trackerInfo.weightConsumed", 0] },
                          "$mealWeight",
                        ],
                      },
                      else: 0,
                    },
                  },
                ],
              },
              else: 0,
            },
          },

          actualFats: {
            $cond: {
              if: { $gt: [{ $size: "$trackerInfo" }, 0] },
              then: {
                $multiply: [
                  "$fat",
                  {
                    $cond: {
                      if: { $gt: ["$mealWeight", 0] },
                      then: {
                        $divide: [
                          { $arrayElemAt: ["$trackerInfo.weightConsumed", 0] },
                          "$mealWeight",
                        ],
                      },
                      else: 0,
                    },
                  },
                ],
              },
              else: 0,
            },
          },

          actualCarbs: {
            $cond: {
              if: { $gt: [{ $size: "$trackerInfo" }, 0] },
              then: {
                $multiply: [
                  "$carbs",
                  {
                    $cond: {
                      if: { $gt: ["$mealWeight", 0] },
                      then: {
                        $divide: [
                          { $arrayElemAt: ["$trackerInfo.weightConsumed", 0] },
                          "$mealWeight",
                        ],
                      },
                      else: 0,
                    },
                  },
                ],
              },
              else: 0,
            },
          },
        },
      },

      // Stage 4: Group by date and sum nutrients for each day
      {
        $group: {
          _id: "$dateOnly", // Group by date
          date: { $first: "$dateOnly" },

          // Sum scheduled nutrients for the day
          totalScheduledCalories: { $sum: "$scheduledCalories" },
          totalScheduledProteins: { $sum: "$scheduledProteins" },
          totalScheduledFats: { $sum: "$scheduledFats" },
          totalScheduledCarbs: { $sum: "$scheduledCarbs" },

          // Sum actual consumed nutrients for the day
          totalActualCalories: { $sum: "$actualCalories" },
          totalActualProteins: { $sum: "$actualProteins" },
          totalActualFats: { $sum: "$actualFats" },
          totalActualCarbs: { $sum: "$actualCarbs" },

          // Track if any meals were tracked on this day
          hasTracking: {
            $max: {
              $cond: [
                {
                  $gt: [
                    {
                      $add: [
                        "$actualCalories",
                        "$actualProteins",
                        "$actualFats",
                        "$actualCarbs",
                      ],
                    },
                    0,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      // Stage 5: Sort by date
      {
        $sort: { date: 1 },
      },

      // Stage 6: Format the final output
      {
        $project: {
          _id: 0,
          date: 1,
          scheduled: {
            calories: { $round: ["$totalScheduledCalories", 2] },
            proteins: { $round: ["$totalScheduledProteins", 2] },
            fats: { $round: ["$totalScheduledFats", 2] },
            carbs: { $round: ["$totalScheduledCarbs", 2] },
          },
          actual: {
            calories: {
              $cond: [
                { $eq: ["$hasTracking", 1] },
                { $round: ["$totalActualCalories", 2] },
                null,
              ],
            },
            proteins: {
              $cond: [
                { $eq: ["$hasTracking", 1] },
                { $round: ["$totalActualProteins", 2] },
                null,
              ],
            },
            fats: {
              $cond: [
                { $eq: ["$hasTracking", 1] },
                { $round: ["$totalActualFats", 2] },
                null,
              ],
            },
            carbs: {
              $cond: [
                { $eq: ["$hasTracking", 1] },
                { $round: ["$totalActualCarbs", 2] },
                null,
              ],
            },
          },
          adherence: {
            calories: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$hasTracking", 1] },
                    { $gt: ["$totalScheduledCalories", 0] },
                  ],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$totalActualCalories",
                            "$totalScheduledCalories",
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
            proteins: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$hasTracking", 1] },
                    { $gt: ["$totalScheduledProteins", 0] },
                  ],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$totalActualProteins",
                            "$totalScheduledProteins",
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
            fats: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$hasTracking", 1] },
                    { $gt: ["$totalScheduledFats", 0] },
                  ],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: ["$totalActualFats", "$totalScheduledFats"],
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
            carbs: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$hasTracking", 1] },
                    { $gt: ["$totalScheduledCarbs", 0] },
                  ],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$totalActualCarbs",
                            "$totalScheduledCarbs",
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
          },
        },
      },
    ]);

    // Fill in missing dates with zero values for better graph continuity
    const filledResult = DietProgressServices.fillMissingDates(
      result,
      start,
      end,
      viewType
    );

    return {
      message: "Diet graph progress retrieved successfully",
      data: filledResult,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        viewType,
      },
    };
  }

  // Helper method to fill missing dates
  static fillMissingDates(
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
            calories: 0,
            proteins: 0,
            fats: 0,
            carbs: 0,
          },
          actual: {
            calories: null,
            proteins: null,
            fats: null,
            carbs: null,
          },
          adherence: {
            calories: null,
            proteins: null,
            fats: null,
            carbs: null,
          },
        });
      }

      // Move to next day
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return filledData;
  }
}

export default DietProgressServices;
