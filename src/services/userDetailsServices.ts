import { User } from "../models/UserModel";
import { CustomError } from "../utils/customError";
import { Goal } from "../models/GoalsModel";
import { Workout } from "../models/WorkoutModel";
import { Tracker } from "../models/TrackerModel";

interface UpdateUserDetailsServiceProps {
  phone_num: string;
  dob: Date;
  country: string;
  height: number;
  weight: number;
}

interface UserComprehensiveInfo {
  user: any;
  fitnessStats: {
    totalGoals: number;
    completedGoals: number;
    workoutsThisMonth: number;
    streak: number;
    bmi: number;
    age: number;
  };
}

class UserDetailsServices {
  static async getUserDetailsService(userId: string) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return user;
  }

  static async updateUserDetailsService({
    userId,
    updates,
  }: {
    userId: string;
    updates: Partial<UpdateUserDetailsServiceProps>;
  }) {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new CustomError("User not found", 404);
    }

    return updatedUser;
  }

  static async getUserComprehensiveInfoService(userId: string): Promise<UserComprehensiveInfo> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get goals count
    const totalGoals = await Goal.countDocuments({ userId: user._id });
    const completedGoals = await Goal.countDocuments({ 
      userId: user._id, 
      status: "completed" 
    });

    // Get workouts this month
    const workoutsThisMonth = await Workout.countDocuments({
      userId: user._id,
      workoutDateAndTime: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate BMI
    let bmi = 0;
    if (user.height && user.weight) {
      const heightInMeters = user.height / 100; // Convert cm to meters
      bmi = Number((user.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    // Calculate age
    let age = 0;
    if (user.dob) {
      const birthDate = new Date(user.dob);
      age = now.getFullYear() - birthDate.getFullYear();
      const monthDiff = now.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Calculate streak (count consecutive days with any activity)
    let streak = 0;
    if (user._id) {
      try {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date;
        });

        let consecutiveDays = 0;
        for (let i = 0; i < last7Days.length; i++) {
          const dayStart = new Date(last7Days[i]);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(last7Days[i]);
          dayEnd.setHours(23, 59, 59, 999);

          // Check for any activity (workouts, diet, sleep tracking)
          const hasWorkout = await Workout.exists({
            userId: user._id,
            workoutDateAndTime: { $gte: dayStart, $lte: dayEnd }
          });

          const hasTracker = await Tracker.exists({
            userId: user._id,
            date: { $gte: dayStart, $lte: dayEnd }
          });

          if (hasWorkout || hasTracker) {
            consecutiveDays++;
          } else {
            break;
          }
        }
        streak = consecutiveDays;
      } catch (error) {
        console.error('Error calculating streak:', error);
        streak = 0;
      }
    }

    const fitnessStats = {
      totalGoals,
      completedGoals,
      workoutsThisMonth,
      streak,
      bmi,
      age
    };

    return {
      user,
      fitnessStats
    };
  }
}

export { UserDetailsServices };
