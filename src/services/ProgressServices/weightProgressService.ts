import mongoose from "mongoose";
import { Goal } from "../../models/GoalsModel";
import { IWeightGoalData } from "../../models/GoalsModel";

class WeightProgressServices {
  static async getWeightGoalProgressService(goalId: string) {
    // Validate goalId format
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      throw new Error("Invalid goal ID format");
    }

    // Fetch the weight goal
    const goal = await Goal.findById(goalId);

    console.log("This is pre service start");
    console.log(JSON.stringify(goal, null, 2));

    if (!goal) {
      throw new Error("Goal not found");
    }

    if (goal.category !== "weight") {
      throw new Error("Goal is not a weight goal");
    }

    const goalData = goal.data;
    const {
      goalType,
      targetWeight,
      currentWeight,
      previousWeights = [],
    } = goalData;

    console.log("This is the service");
    console.log(goalData.goalType);

    // Get starting weight (first entry in previousWeights or current if no history)
    const startWeight =
      previousWeights.length > 0 ? previousWeights[0].weight : currentWeight;

    console.log(startWeight)
    console.log(previousWeights)

    // Calculate total weight change needed
    const totalWeightChange = Math.abs(targetWeight - startWeight);

    console.log("This is total weight change");
    console.log(totalWeightChange);

    // Calculate current weight change achieved
    const currentWeightChange = Math.abs(currentWeight - startWeight);

    // Calculate progress percentage
    let progress = 0;

    if (totalWeightChange > 0) {
      if (goalType === "loss") {
        // For weight loss: progress increases as weight decreases
        if (currentWeight <= targetWeight) {
          progress = 100; // Goal achieved or exceeded
        } else {
          progress = (currentWeightChange / totalWeightChange) * 100;
        }
      } else if (goalType === "gain") {
        // For weight gain: progress increases as weight increases
        if (currentWeight >= targetWeight) {
          progress = 100; // Goal achieved or exceeded
        } else {
          progress = (currentWeightChange / totalWeightChange) * 100;
        }
      } else if (goalType === "maintenance") {
        // For maintenance: progress based on how close to target (within 2 lbs = 100%)
        const deviation = Math.abs(currentWeight - targetWeight);
        progress = Math.max(0, 100 - (deviation / 2) * 100);
        console.log("This is the deviation");
        console.log(deviation);
        console.log(progress);
      }
    }

    // Cap progress at 100%
    progress = Math.min(progress, 100);
    console.log("before returning");
    console.log(goalId);
    console.log(progress);
    return {
      goalId,
      progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
      message: "Weight goal progress calculated successfully",
    };
  }

  static async getWeightGraphProgressService(userId: string) {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    // Get all weight goals for the user
    const weightGoals = await Goal.find({
      userId: new mongoose.Types.ObjectId(userId),
      category: "weight",
    }).sort({ createdAt: -1 });

    if (weightGoals.length === 0) {
      return {
        message: "No weight goals found for user",
        data: [],
        totalGoals: 0,
      };
    }

    // Collect all weight data points from all goals
    const allWeightData: any[] = [];

    weightGoals.forEach((goal) => {
      // Type cast to weight goal since we filtered by category: "weight"
      const goalData = goal.data as IWeightGoalData;
      const { currentWeight, previousWeights = [] } = goalData;

      // Add previous weights with their dates
      previousWeights.forEach((weightEntry) => {
        allWeightData.push({
          weight: weightEntry.weight,
          date: new Date(weightEntry.date),
          goalId: goal._id,
          goalType: goalData.goalType,
          targetWeight: goalData.targetWeight,
        });
      });

      // Add current weight with today's date (or goal's updated date)
      allWeightData.push({
        weight: currentWeight,
        date: new Date(goal.updatedAt),
        goalId: goal._id,
        goalType: goalData.goalType,
        targetWeight: goalData.targetWeight,
        isCurrent: true,
      });
    });

    // Sort all weight data by date (oldest to newest)
    allWeightData.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Remove duplicates by date (keep the latest entry for each date)
    const uniqueWeightData = [];
    const seenDates = new Set();

    for (let i = allWeightData.length - 1; i >= 0; i--) {
      const dateStr = allWeightData[i].date.toISOString().split("T")[0];
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        uniqueWeightData.unshift({
          weight: allWeightData[i].weight,
          date: allWeightData[i].date.toISOString().split("T")[0], // Format as YYYY-MM-DD
          goalId: allWeightData[i].goalId,
          goalType: allWeightData[i].goalType,
          targetWeight: allWeightData[i].targetWeight,
          isCurrent: allWeightData[i].isCurrent || false,
        });
      }
    }

    return {
      message: "Weight graph data retrieved successfully",
      data: uniqueWeightData,
      totalGoals: weightGoals.length,
      dateRange: {
        start: uniqueWeightData.length > 0 ? uniqueWeightData[0].date : null,
        end:
          uniqueWeightData.length > 0
            ? uniqueWeightData[uniqueWeightData.length - 1].date
            : null,
      },
    };
  }
}

export { WeightProgressServices };
