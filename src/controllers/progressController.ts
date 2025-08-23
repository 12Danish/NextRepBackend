import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import DietProgressServices from "../services/ProgressServices/dietProgressServices";

import { WorkoutProgressServices } from "../services/ProgressServices/workoutProgressServices";
import { SleepProgressServices } from "../services/ProgressServices/sleepPorgressService";
import { WeightProgressServices } from "../services/ProgressServices/weightProgressService";
import GoalServices from "../services/goalServices";
import DietServices from "../services/dietService";
import WorkoutServices from "../services/workoutServices";
import SleepServices from "../services/sleepService";

const getWorkoutGraphProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    // Extract viewType from query params (default to 'week')
    const { viewType = "week" } = req.query;

    // Call the workout graph progress service
    const result = await WorkoutProgressServices.getWorkoutGraphProgressService(
      {
        userId,
        viewType: viewType as "day" | "week" | "month",
      }
    );

    res.status(200).json({
      result,
    });
  } catch (err) {
    next(err);
  }
};

const getWorkoutGoalProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract goalId from URL parameters
    const { goalId } = req.params;

    // Call the workout goal progress service
    const result =
      await WorkoutProgressServices.getWorkoutGoalProgressService(goalId);

    res.status(200).json({
      result,
    });
  } catch (err) {
    next(err);
  }
};

const getWeightGoalProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {

    const goalId = req.params.goalId;

    const result = await WeightProgressServices.getWeightGoalProgressService(goalId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getDietGoalProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const goalId = req.params.goalId;

    // Fix: Call the service method with goalId parameter
    const result =
      await DietProgressServices.getDietGoalProgressService(goalId);

    res.status(200).json({
      success: true,
      message: result.message,
      progress: result.progress,
    });
  } catch (err) {
    next(err);
  }
};

const getDietGraphProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    // Get viewType from query parameters or body
    const viewType = req.query.viewType ? req.query.viewType : "week";

    // Call the service method
    const result = await DietProgressServices.getDietGraphProgressService({
      userId,
      viewType: viewType,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      dateRange: result.dateRange,
    });
  } catch (err) {
    next(err);
  }
};

const getWeightGraphProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const result =
      await WeightProgressServices.getWeightGraphProgressService(userId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getSleepGraphStatsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    // Extract viewType from query params (default to 'week')
    const { viewType = "week" } = req.query;

    const result = await SleepProgressServices.getSleepGraphDataService({
      userId,
      viewType,
    });

    res.status(200).json({
      result,
    });
  } catch (err) {
    next(err);
  }
};

const getOverviewStatsController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get workout stats for today
    let workoutStats;
    try {
      workoutStats = await WorkoutProgressServices.getWorkoutGraphProgressService({
        userId,
        viewType: "day",
      });
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      workoutStats = { data: [] };
    }

    // Get diet stats for today
    let dietStats;
    try {
      dietStats = await DietProgressServices.getDietGraphProgressService({
        userId,
        viewType: "day",
      });
    } catch (error) {
      console.error('Error fetching diet stats:', error);
      dietStats = { data: [] };
    }

    // Get sleep stats for today
    let sleepStats;
    try {
      sleepStats = await SleepProgressServices.getSleepGraphDataService({
        userId,
        viewType: "day",
      });
    } catch (error) {
      console.error('Error fetching sleep stats:', error);
      sleepStats = { data: [] };
    }

    // Calculate today's totals with proper fallbacks
    const todayWorkoutMinutes = workoutStats?.data?.[0]?.actual?.totalDuration || 0;
    const todayCalories = dietStats?.data?.[0]?.actual?.calories || 0;
    const todaySleepHours = sleepStats?.data?.[0]?.duration || 0;

    // Ensure we have valid numbers and handle NaN/undefined values
    const workoutMinutes = (typeof todayWorkoutMinutes === 'number' && !isNaN(todayWorkoutMinutes)) ? todayWorkoutMinutes : 0;
    const calories = (typeof todayCalories === 'number' && !isNaN(todayCalories)) ? todayCalories : 0;
    const sleepHours = (typeof todaySleepHours === 'number' && !isNaN(todaySleepHours)) ? todaySleepHours : 0;

    const response = {
      success: true,
      data: {
        workout: {
          minutes: workoutMinutes,
          hours: workoutMinutes > 0 ? Math.round((workoutMinutes / 60) * 10) / 10 : 0,
        },
        calories: calories,
        sleep: {
          hours: sleepHours > 0 ? Math.round(sleepHours * 10) / 10 : 0,
          minutes: sleepHours > 0 ? Math.round(sleepHours * 60) : 0,
        },
      },
    };

    console.log('Final Response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

const getTodayScheduleController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's workouts
    const workouts = await WorkoutServices.getWorkoutScheduleService({
      userId,
      viewType: "day",
      offset: 0,
      particularDate: today,
    });

    // Get today's diets
    const diets = await DietServices.getDietsService({
      userId,
      viewType: "day",
      offset: 0,
      particularDate: today,
    });

    // Get today's sleep goal
    const sleepGoal = await GoalServices.getGoalsService({
      userId,
      category: "sleep",
      status: "pending",
      skip: 0,
      limit: 1,
    });

    // Format the schedule
    const schedule = {
      workouts: workouts.workouts.map((workout: any) => ({
        id: workout._id,
        name: workout.exerciseName,
        time: workout.workoutDateAndTime,
        duration: workout.duration,
        type: 'workout',
      })),
      meals: diets.diets.map((diet: any) => ({
        id: diet._id,
        name: diet.foodName,
        time: diet.mealDateAndTime,
        meal: diet.meal,
        calories: diet.calories,
        type: 'meal',
      })),
      sleep: sleepGoal.goals?.[0] ? {
        id: sleepGoal.goals[0]._id,
        targetHours: (sleepGoal.goals[0].data as any).targetHours,
        type: 'sleep',
      } : null,
    };

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
};

const getCurrentMealPlanController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's diets
    const diets = await DietServices.getDietsService({
      userId,
      viewType: "day",
      offset: 0,
      particularDate: today,
    });

    // Group by meal type
    const mealPlan = {
      breakfast: diets.diets.filter((d: any) => d.meal === 'breakfast'),
      lunch: diets.diets.filter((d: any) => d.meal === 'lunch'),
      dinner: diets.diets.filter((d: any) => d.meal === 'dinner'),
      snack: diets.diets.filter((d: any) => d.meal === 'snack'),
    };

    // Calculate totals
    const totalCalories = diets.diets.reduce((sum: number, diet: any) => sum + diet.calories, 0);
    const totalProtein = diets.diets.reduce((sum: number, diet: any) => sum + diet.protein, 0);
    const totalCarbs = diets.diets.reduce((sum: number, diet: any) => sum + diet.carbs, 0);
    const totalFat = diets.diets.reduce((sum: number, diet: any) => sum + diet.fat, 0);

    res.status(200).json({
      success: true,
      data: {
        meals: mealPlan,
        totals: {
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getOverviewGoalProgressController = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    // Get active goals for different categories
    const workoutGoals = await GoalServices.getGoalsService({
      userId,
      category: "workout",
      status: "pending",
      skip: 0,
      limit: 5,
    });

    const dietGoals = await GoalServices.getGoalsService({
      userId,
      category: "diet",
      status: "pending",
      skip: 0,
      limit: 5,
    });

    const sleepGoals = await GoalServices.getGoalsService({
      userId,
      category: "sleep",
      status: "pending",
      skip: 0,
      limit: 5,
    });

    // Get progress data for the last 7 days
    const workoutProgress = await WorkoutProgressServices.getWorkoutGraphProgressService({
      userId,
      viewType: "week",
    });

    const dietProgress = await DietProgressServices.getDietGraphProgressService({
      userId,
      viewType: "week",
    });

    const sleepProgress = await SleepProgressServices.getSleepGraphDataService({
      userId,
      viewType: "week",
    });

    res.status(200).json({
      success: true,
      data: {
        goals: {
          workout: workoutGoals.goals || [],
          diet: dietGoals.goals || [],
          sleep: sleepGoals.goals || [],
        },
        progress: {
          workout: workoutProgress.data || [],
          diet: dietProgress.data || [],
          sleep: sleepProgress.data || [],
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export {
  getDietGoalProgressController,
  getDietGraphProgressController,
  getWeightGraphProgressController,
  getWorkoutGoalProgressController,
  getWeightGoalProgressController,
  getWorkoutGraphProgressController,
  getSleepGraphStatsController,
  getOverviewStatsController,
  getTodayScheduleController,
  getCurrentMealPlanController,
  getOverviewGoalProgressController,
};
