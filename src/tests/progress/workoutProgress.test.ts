// COMPLETE WORKOUT PROGRESS TEST SUITE
import { registerAndLoginUser } from "../testUtils";
import mongoose from "mongoose";

describe("Workout Progress Tests Suite", () => {
  let agent: any;
  let workoutGoalId: string;
  let workoutId1: string;
  let workoutId2: string;
  let trackerId1: string;
  let trackerId2: string;

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  beforeAll(async () => {
    agent = await registerAndLoginUser();

    // Experimenting with user who has no workouts scheduled
    const res = await agent
      .get("/api/progress/WorkoutGraphProgress")
      .query({ viewType: "day" });

    expect(res.status).toBe(200);

    console.log("before");
    console.log(res.body);
    expect(res.body.result.data[0].scheduled.totalDuration).toBe(0);
    expect(res.body.result.data[0].actual.totalDuration).toBe(null);
    console.log("This for initial user");
    console.log(res.body.result.data[0].scheduled.totalDuration);

    // Create a workout goal
    const workoutGoal = {
      category: "workout",
      startDate: yesterday.toISOString(),
      targetDate: tomorrow.toISOString(),
      description: "Complete 300 minutes of exercise for fitness improvement",
      status: "pending",
      data: {
        targetMinutes: 300,
        exerciseName: "Mixed Cardio & Strength Training",
      },
    };

    const goalRes = await agent.post("/api/goal/add").send(workoutGoal);
    workoutGoalId = goalRes.body.newGoal._id;

    // Create first workout entry (cardio)
    const workout1 = {
      type: "cardio",
      exerciseName: "Running",
      duration: 45, // 45 minutes scheduled
      reps: 0,
      targetMuscleGroup: ["legs", "core"],
      workoutDateAndTime: today.toISOString(),
      goalId: workoutGoalId,
    };

    const workoutRes1 = await agent.post("/api/workout/create").send(workout1);

    console.log("This is workout res");
    console.log(workoutRes1.body);
    workoutId1 = workoutRes1.body.newWorkout._id;

    // Create second workout entry (strength training)
    const workout2 = {
      type: "weight lifting",
      exerciseName: "Bench Press",
      duration: 60, // 60 minutes scheduled
      reps: 12,
      targetMuscleGroup: ["chest", "arms"],
      workoutDateAndTime: today.toISOString(),
      goalId: workoutGoalId,
    };

    const workoutRes2 = await agent.post("/api/workout/create").send(workout2);
    workoutId2 = workoutRes2.body.newWorkout._id;

    // Create tracker entry for first workout (partial completion)
    const tracker1 = {
      type: "workout",
      date: today.toISOString(),
      workoutOrDietData: {
        completedTime: 30, // Completed 30 minutes out of 45 planned
        completedReps: 0,
      },
    };

    const trackerRes1 = await agent
      .post(`/api/tracker/addTracking/${workoutId1}`)
      .send(tracker1);
    trackerId1 = trackerRes1.body.newTracker._id;

    // Create tracker entry for second workout (exceeded planned time)
    const tracker2 = {
      type: "workout",
      date: today.toISOString(),
      workoutOrDietData: {
        completedTime: 75, // Completed 75 minutes out of 60 planned
        completedReps: 15,
      },
    };

    const trackerRes2 = await agent
      .post(`/api/tracker/addTracking/${workoutId2}`)
      .send(tracker2);
    trackerId2 = trackerRes2.body.newTracker._id;
  });

  describe("GET /api/progress/WorkoutGoalProgress/:goalId", () => {
    it("should get workout goal progress with tracking data", async () => {
      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${workoutGoalId}`
      );

      console.log("This is the first test");
      console.log(res.body);

      console.log("Workout Goal Progress Response:");
      console.log(JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);

      // Check if response has result structure
      if (res.body.result) {
        expect(res.body.result).toHaveProperty("message");

        const data = res.body.result;
        expect(data).toHaveProperty("progress");

        console.log("Workout goal progress test");
        console.log(res.body);

        // Check progress structure
        expect(data.progress).toHaveProperty("duration");
        expect(data.progress).toHaveProperty("workoutSessions");
        expect(data.progress).toHaveProperty("overall");

        // Check duration data structure
        expect(data.progress.duration).toHaveProperty("target");
        expect(data.progress.duration).toHaveProperty("actual");
        expect(data.progress.duration).toHaveProperty("progress");
        expect(data.progress.duration).toHaveProperty("status");

        // Verify target values match goal
        expect(data.progress.duration.target).toBe(300);

        // Check calculated actual values
        // Workout 1: 30 minutes completed
        // Workout 2: 75 minutes completed
        // Total: 105 minutes
        expect(data.progress.duration.actual).toBe(105);

        // Check progress percentage: 105/300 * 100 = 35%
        expect(data.progress.duration.progress).toBeCloseTo(35, 1);
        expect(data.progress.duration.status).toBe("in_progress");

        // Check workout sessions data
        expect(data.progress.workoutSessions.completed).toBe(2);
        expect(data.progress.workoutSessions.scheduledMinutes).toBe(105); // 45 + 60
        expect(data.progress.workoutSessions.completedMinutes).toBe(105); // 30 + 75
      } else {
        // Fallback to old structure
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty("data");
        expect(res.body.data).toHaveProperty("message");
        expect(res.body.data).toHaveProperty("progress");
      }
    });

    it("should return 404 for non-existent goal", async () => {
      const invalidGoalId = new mongoose.Types.ObjectId();
      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${invalidGoalId}`
      );

      expect(res.status).toBe(404);
      // Check both possible response structures
      if (res.body.result) {
        expect(res.body.result.success).toBe(false);
      } else {
        expect(res.body.success).toBe(false);
      }
    });

    it("should return 400 for invalid goal ID format", async () => {
      const res = await agent.get(
        "/api/progress/WorkoutGoalProgress/invalidId"
      );

      expect(res.status).toBe(400);
      if (res.body.result) {
        expect(res.body.result.success).toBe(false);
      } else {
        expect(res.body.success).toBe(false);
      }
    });

    it("should handle goal with no scheduled workouts", async () => {
      // Create a new goal with no workouts
      const emptyGoal = {
        category: "workout",
        startDate: today.toISOString(),
        targetDate: tomorrow.toISOString(),
        description: "Empty workout goal",
        status: "pending",
        data: {
          targetMinutes: 200,
          exerciseName: "General Fitness",
        },
      };

      const goalRes = await agent.post("/api/goal/add").send(emptyGoal);
      const emptyGoalId = goalRes.body.newGoal._id;

      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${emptyGoalId}`
      );

      expect(res.status).toBe(200);

      console.log("intermediate failure");
      console.log(res.body);

      if (res.body.result) {
        expect(res.body.result.message).toContain(
          "No workout has been scheduled"
        );
        expect(res.body.result.progress).toEqual({});
      }
    });

    it("should handle non-workout category goal", async () => {
      // Create a diet goal instead of workout goal
      const dietGoal = {
        category: "diet",
        startDate: today.toISOString(),
        targetDate: tomorrow.toISOString(),
        description: "Diet goal",
        status: "pending",
        data: {
          targetCalories: 2000,
          targetProteins: 150,
          targetFats: 70,
          targetCarbs: 250,
        },
      };

      const goalRes = await agent.post("/api/goal/add").send(dietGoal);
      const dietGoalId = goalRes.body.newGoal._id;

      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${dietGoalId}`
      );

      expect(res.status).toBe(400);
      if (res.body.result) {
        expect(res.body.result.message).toContain("Category must be workout");
      } else {
        expect(res.body.message).toContain("Category must be workout");
      }
    });
  });

  describe("GET /api/progress/WorkoutGraphProgress", () => {
    it("should get day view workout graph progress", async () => {
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "day" });

      console.log("Day View Workout Graph Progress:");
      console.log(JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);

      // Handle both response structures
      const responseData = res.body.result || res.body.data;

      expect(responseData).toHaveProperty("data");
      expect(responseData).toHaveProperty("dateRange");

      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData.data.length).toBe(1); // Single day

      const dayData = responseData.data[0];
      expect(dayData).toHaveProperty("date");
      expect(dayData).toHaveProperty("scheduled");
      expect(dayData).toHaveProperty("actual");
      expect(dayData).toHaveProperty("adherence");
      expect(dayData).toHaveProperty("workoutSummary");
      console.log("Current error test");
      console.log(JSON.stringify(res.body, null, 2));

      // Check scheduled totals (45 + 60 = 105 minutes)
      expect(dayData.scheduled.totalDuration).toBe(105);
      expect(dayData.scheduled.workoutCount).toBe(2);

      // Check actual completion (30 + 75 = 105 minutes)
      expect(dayData.actual.totalDuration).toBe(105);
      expect(dayData.actual.completedWorkouts).toBe(2);

      // Check adherence (105/105 = 100%)
      expect(dayData.adherence.durationAdherence).toBe(100);
      expect(dayData.adherence.workoutCompletion).toBe(100);

      // Check workout summary
      expect(dayData.workoutSummary.types).toContain("cardio");
      expect(dayData.workoutSummary.types).toContain("weight lifting");
      expect(dayData.workoutSummary.targetMuscleGroups).toEqual(
        expect.arrayContaining(["legs", "core", "chest", "arms"])
      );
      expect(dayData.workoutSummary.details).toHaveLength(2);
    });

    it("should get week view workout graph progress", async () => {
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "week" });

      expect(res.status).toBe(200);

      const responseData = res.body.result || res.body.data;

      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData.data.length).toBe(7); // 7 days
      expect(responseData.dateRange.viewType).toBe("week");

      console.log("Week view workout progress");
      console.log(JSON.stringify(res.body, null, 2));

      // Should have data for today and empty data for other days
      const todayData = responseData.data.find(
        (d: any) => d.date === today.toISOString().split("T")[0]
      );
      expect(todayData).toBeDefined();
      expect(todayData.scheduled.totalDuration).toBeGreaterThan(0);

      // Other days should have zero scheduled data
      const emptyDays = responseData.data.filter(
        (d: any) => d.date !== today.toISOString().split("T")[0]
      );
      expect(emptyDays.length).toBe(6);
      expect(emptyDays[0].scheduled.totalDuration).toBe(0);
    });

    it("should get month view workout graph progress", async () => {
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "month" });

      expect(res.status).toBe(200);

      const responseData = res.body.result || res.body.data;

      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData.data.length).toBeGreaterThanOrEqual(28); // At least 28 days
      expect(responseData.data.length).toBeLessThanOrEqual(31); // At most 31 days
      expect(responseData.dateRange.viewType).toBe("month");
    });
  });

  describe("Progress Calculations Accuracy", () => {
    it("should calculate correct progress with mixed completion rates", async () => {
      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${workoutGoalId}`
      );

      // Expected calculations:
      // Workout 1: 45 min scheduled, 30 min completed
      // Workout 2: 60 min scheduled, 75 min completed
      // Total scheduled: 105 min, Total completed: 105 min
      // Target: 300 min
      // Progress: 105/300 * 100 = 35%

      const data = res.body.result;

      console.log("This is the new test which is failing");
      console.log(JSON.stringify(res.body, null, 2));

      expect(data.progress.duration.actual).toBe(105);
      expect(data.progress.duration.progress).toBeCloseTo(35, 1);
      expect(data.progress.duration.status).toBe("in_progress");
      expect(data.progress.overall.completionRate).toBeCloseTo(35, 1);
    });

    it("should handle workout exceeding planned duration", async () => {
      // The second workout exceeded planned time (75 min vs 60 min planned)
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "day" });

      const responseData = res.body.result || res.body.data;
      const dayData = responseData.data[0];

      // Check individual workout details
      const benchPressWorkout = dayData.workoutSummary.details.find(
        (w: any) => w.exerciseName === "Bench Press"
      );
      expect(benchPressWorkout.scheduledDuration).toBe(60);
      expect(benchPressWorkout.actualDuration).toBe(75);
      expect(benchPressWorkout.isTracked).toBe(1);
    });

    it("should show correct adherence percentages in graph data", async () => {
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "day" });

      const responseData = res.body.result || res.body.data;
      const dayData = responseData.data[0];

      // Duration Adherence = (actual / scheduled) * 100
      // Total: 105 actual / 105 scheduled * 100 = 100%
      expect(dayData.adherence.durationAdherence).toBe(100);

      // Workout Completion = (tracked / total) * 100
      // 2 tracked / 2 total * 100 = 100%
      expect(dayData.adherence.workoutCompletion).toBe(100);

      // Should have adherence data since tracking exists
      expect(dayData.adherence.durationAdherence).not.toBe(null);
      expect(dayData.adherence.workoutCompletion).not.toBe(null);
    });
  });

  describe("Edge Cases", () => {
    it("should handle goal with scheduled workouts but no tracking", async () => {
      // Create new goal and workout without tracking
      const unTrackedGoal = {
        category: "workout",
        startDate: today.toISOString(),
        targetDate: tomorrow.toISOString(),
        description: "Untracked workout goal",
        status: "pending",
        data: {
          targetMinutes: 180,
          exerciseName: "Yoga Sessions",
        },
      };

      const goalRes = await agent.post("/api/goal/add").send(unTrackedGoal);
      const unTrackedGoalId = goalRes.body.newGoal._id;

      // Create workout but don't track it
      const untrackedWorkout = {
        type: "yoga",
        exerciseName: "Morning Yoga",
        duration: 30,
        reps: 0,
        targetMuscleGroup: ["core"],
        workoutDateAndTime: today.toISOString(),
        goalId: unTrackedGoalId,
      };

      await agent.post("/api/workout/create").send(untrackedWorkout);

      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${unTrackedGoalId}`
      );

      expect(res.status).toBe(200);

      console.log("Res body error");
      console.log(res.body);

      const data = res.body.result 
      expect(data.message).toContain("No tracking data found");
      expect(data.progress).toEqual({});
    });

    it("should handle zero duration workouts", async () => {
      // Create workout with zero duration
      const zeroDurationWorkout = {
        type: "cross fit",
        exerciseName: "Flexibility Stretch",
        duration: 0, // Zero duration
        reps: 10,
        targetMuscleGroup: ["arms", "legs"],
        workoutDateAndTime: today.toISOString(),
        goalId: workoutGoalId,
      };

      const workoutRes = await agent
        .post("/api/workout/create")
        .send(zeroDurationWorkout);
      const zeroDurationWorkoutId = workoutRes.body.newWorkout._id;

      // Try to track it
      const tracker = {
        type: "workout",
        date: today.toISOString(),
        workoutOrDietData: {
          completedTime: 15,
          completedReps: 8,
        },
      };

      await agent
        .post(`/api/tracker/addTracking/${zeroDurationWorkoutId}`)
        .send(tracker);

      // Should still work without division by zero errors
      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${workoutGoalId}`
      );
      expect(res.status).toBe(200);

      const data = res.body.result ;

      // Total should now include the additional 15 minutes
      expect(data.progress.duration.actual).toBe(120); // 105 + 15
    });

    it("should handle missing completedTime in tracker", async () => {
      // Create workout
      const workoutWithoutTime = {
        type: "yoga",
        exerciseName: "Evening Meditation",
        duration: 20,
        reps: 0,
        targetMuscleGroup: ["core"],
        workoutDateAndTime: today.toISOString(),
        goalId: workoutGoalId,
      };

      const workoutRes = await agent
        .post("/api/workout/create")
        .send(workoutWithoutTime);
      const workoutWithoutTimeId = workoutRes.body.newWorkout._id;

      // Create tracker without completedTime
      const trackerWithoutTime = {
        type: "workout",
        date: today.toISOString(),
        workoutOrDietData: {
          completedReps: 5,
          // No completedTime provided
        },
      };

      await agent
        .post(`/api/tracker/addTracking/${workoutWithoutTimeId}`)
        .send(trackerWithoutTime);

      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${workoutGoalId}`
      );

      expect(res.status).toBe(200);
      // Should handle missing completedTime as 0
    });
  });

  describe("Graph Progress Date Ranges", () => {
    it("should return correct date range for day view", async () => {
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "day" });

      const responseData = res.body.result || res.body.data;

      const startDate = new Date(responseData.dateRange.start);
      const endDate = new Date(responseData.dateRange.end);

      // Should be exactly 1 day difference
      const diffInDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBe(1);
    });

    it("should return correct date range for week view", async () => {
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "week" });

      const responseData = res.body.result || res.body.data;

      const startDate = new Date(responseData.dateRange.start);
      const endDate = new Date(responseData.dateRange.end);

      // Should be exactly 7 days difference
      const diffInDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBe(7);
    });

    it("should fill missing dates correctly", async () => {
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "week" });

      const responseData = res.body.result || res.body.data;

      // Should have 7 consecutive dates
      expect(responseData.data.length).toBe(7);

      // Dates should be consecutive
      for (let i = 1; i < responseData.data.length; i++) {
        const prevDate = new Date(responseData.data[i - 1].date);
        const currDate = new Date(responseData.data[i].date);
        const diffInDays =
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffInDays).toBe(1);
      }

      // Days without scheduled workouts should have zero scheduled values
      const daysWithoutWorkouts = responseData.data.filter(
        (d: any) => d.scheduled.totalDuration === 0
      );
      expect(daysWithoutWorkouts.length).toBeGreaterThan(0);

      // Days without workouts should have null actual values
      daysWithoutWorkouts.forEach((day: any) => {
        expect(day.actual.totalDuration).toBe(null);
        expect(day.adherence.durationAdherence).toBe(null);
      });
    });
  });

  describe("Real-world Scenarios", () => {

    it("should handle multiple days with different tracking patterns", async () => {
      // Create workout for yesterday (without tracking)
      const yesterdayWorkout = {
        type: "cardio",
        exerciseName: "Yesterday Run",
        duration: 40,
        reps: 0,
        targetMuscleGroup: ["legs"],
        workoutDateAndTime: yesterday.toISOString(),
        goalId: workoutGoalId,
      };

      await agent.post("/api/workout/create").send(yesterdayWorkout);

      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "week" });

      const responseData = res.body.result || res.body.data;

      // Find yesterday's data
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const yesterdayData = responseData.data.find(
        (d: any) => d.date === yesterdayStr
      );

      if (yesterdayData) {
        expect(yesterdayData.scheduled.totalDuration).toBe(40);
        expect(yesterdayData.actual.totalDuration).toBe(null); // No tracking
        expect(yesterdayData.adherence.durationAdherence).toBe(null);
        expect(yesterdayData.adherence.workoutCompletion).toBe(0);
      }
    });

    it("should handle goal completion scenario", async () => {
      // Create enough tracking to exceed goal target
      // Current total: 120 minutes (105 + 15 from zero duration test)
      // Need to add 180+ more to exceed 300 target

      const additionalWorkout = {
        type: "cardio",
        exerciseName: "Long Cardio Session",
        duration: 120,
        reps: 0,
        targetMuscleGroup: ["legs", "core"],
        workoutDateAndTime: today.toISOString(),
        goalId: workoutGoalId,
      };

      const workoutRes = await agent
        .post("/api/workout/create")
        .send(additionalWorkout);
      const additionalWorkoutId = workoutRes.body.newWorkout._id;

      // Track with time that would exceed goal
      const completionTracker = {
        type: "workout",
        date: today.toISOString(),
        workoutOrDietData: {
          completedTime: 200, // Completed 200 minutes
          completedReps: 0,
        },
      };

      await agent
        .post(`/api/tracker/addTracking/${additionalWorkoutId}`)
        .send(completionTracker);

      const res = await agent.get(
        `/api/progress/WorkoutGoalProgress/${workoutGoalId}`
      );

      const data = res.body.result;

      // Total should now be 320 minutes (120 + 200)
      expect(data.progress.duration.actual).toBe(320);
      expect(data.progress.duration.status).toBe("completed");
      expect(data.progress.overall.status).toBe("goal_achieved");
      expect(data.progress.duration.progress).toBeCloseTo(106.67, 1); // 320/300 * 100
    });

    it("should handle multiple workout types and muscle groups", async () => {
      const res = await agent
        .get("/api/progress/WorkoutGraphProgress")
        .query({ viewType: "day" });

      const responseData = res.body.result || res.body.data;
      const dayData = responseData.data[0];

      // Should contain all workout types we created
      expect(dayData.workoutSummary.types).toEqual(
        expect.arrayContaining([
          "cardio",
          "weight lifting",
          "cross fit",
          "yoga",
        ])
      );

      // Should contain all muscle groups
      expect(dayData.workoutSummary.targetMuscleGroups).toEqual(
        expect.arrayContaining(["legs", "core", "chest", "arms"])
      );

      // Check workout details structure
      dayData.workoutSummary.details.forEach((workout: any) => {
        expect(workout).toHaveProperty("exerciseName");
        expect(workout).toHaveProperty("type");
        expect(workout).toHaveProperty("scheduledDuration");
        expect(workout).toHaveProperty("actualDuration");
        expect(workout).toHaveProperty("isTracked");
      });
    });
  });
});
