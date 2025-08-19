import mongoose from "mongoose";
import { Goal } from "../../models/GoalsModel";
import { CustomError } from "../../utils/customError";
import { Workout } from "../../models/WorkoutModel";
import { Tracker } from "../../models/TrackerModel";
class WorkoutProgessServices {
  static async getWorkoutGraphProgressService(goalId: string) {
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

    // Get all scheduled workouts for this goal
    const mappedScheduledWorkouts = await Workout.find({
      goalId: workoutGoal._id,
    });

    if (!mappedScheduledWorkouts || mappedScheduledWorkouts.length === 0) {
      return {
        message: "No Workout has been scheduled with reference to this goal",
        progress: {},
      };
    }

    // Get diet IDs for tracker lookup
    const workoutIds = mappedScheduledWorkouts.map((diet) => diet._id);

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
    
  }

  static async getWorkoutGoalProgressService() {}
}
