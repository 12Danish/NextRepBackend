import mongoose from "mongoose";
import { CustomError } from "../utils/customError";
import { Workout } from "../models/WorkoutModel";
import CommonUtlis from "./commonUtils";
import { getScheduleServiceProps } from "./commonUtils";
interface addOrUpdateWorkoutServiceProps {
  exerciseName: string;
  type: "weight lifting" | "cardio" | "cross fit" | "yoga";
  userId: mongoose.Types.ObjectId | string;
  targetMuscleGroup: Array<
    "chest" | "back" | "legs" | "arms" | "shoulders" | "core"
  >;
  goalId?: mongoose.Types.ObjectId | string | null;
  workoutDateAndTime: Date;
  duration?: number;
  reps?: number;
}

class WorkoutServices {
  static async addWorkoutService({
    exerciseName,
    type,
    duration,
    reps,
    targetMuscleGroup,
    goalId,
    workoutDateAndTime,
    userId,
  }: addOrUpdateWorkoutServiceProps) {
    if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
      throw new CustomError("Invalid goal ID", 400);
    }

    const newWorkout = await Workout.create({
      exerciseName,
      type,
      duration,
      reps,
      targetMuscleGroup,
      goalId: goalId || null,
      workoutDateAndTime,
      userId,
    });

    return newWorkout;
  }

  static async deleteWorkoutService(workoutId: string) {
    if (!mongoose.Types.ObjectId.isValid(workoutId)) {
      throw new CustomError("Invalid Workout ID", 400);
    }
    const result = await Workout.findByIdAndDelete(workoutId);

    if (!result) {
      throw new CustomError("Workout not found", 404);
    }

    return true;
  }

  static async getWorkoutScheduleService({
    userId,
    viewType,
    offset,
  }: getScheduleServiceProps) {
    const { start, end } = CommonUtlis.calculate_start_and_end_dates(
      viewType,
      offset
    );

    const workouts = await Workout.find({
      userId,
      workoutDateAndTime: { $gte: start, $lte: end },
    }).sort({ workoutDateAndTime: 1 });

    return {
      start,
      end,
      count: workouts.length,
      workouts,
    };
  }

  static async updateWorkoutService({
    userId,
    updates,
    workoutId,
  }: {
    userId: string;
    updates: addOrUpdateWorkoutServiceProps;
    workoutId: string;
  }) {
    if (!mongoose.Types.ObjectId.isValid(workoutId)) {
      throw new CustomError("Invalid goal ID", 400);
    }
    const updatedWorkout = await Workout.findByIdAndUpdate(workoutId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedWorkout) {
      throw new CustomError("Workout not found", 404);
    }

    return updatedWorkout;
  }
}

export default WorkoutServices;
