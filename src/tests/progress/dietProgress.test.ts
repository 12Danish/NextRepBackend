// NOW: COMPLETE TEST SUITE
import { registerAndLoginUser } from "../testUtils";
import mongoose from "mongoose";

describe("Diet Progress Tests Suite", () => {
  let agent: any;
  let dietGoalId: string;
  let dietId1: string;
  let dietId2: string;
  let trackerId1: string;
  let trackerId2: string;

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  beforeAll(async () => {
    agent = await registerAndLoginUser();

    // Experimenting with user who has no diets scheduled

    const res = await agent
      .get("/api/progress/DietGraphProgress")
      .query({ viewType: "day" });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].scheduled.calories).toBe(0);
    expect(res.body.data[0].actual.calories).toBe(null);
    console.log("This for initial user");
    console.log(res.body.data[0].scheduled.calories);

    // Create a diet goal
    const dietGoal = {
      category: "diet",
      startDate: yesterday.toISOString(),
      targetDate: tomorrow.toISOString(),
      description: "Maintain balanced diet for weight loss",
      status: "pending",
      data: {
        targetCalories: 2000,
        targetProteins: 150,
        targetFats: 70,
        targetCarbs: 250,
      },
    };

    const goalRes = await agent.post("/api/goal/add").send(dietGoal);
    dietGoalId = goalRes.body.newGoal._id;

    // Create first diet entry (breakfast)
    const diet1 = {
      foodName: "Oatmeal with Berries",
      meal: "breakfast",
      calories: 350,
      carbs: 60,
      protein: 12,
      fat: 8,
      mealDateAndTime: today.toISOString(),
      mealWeight: 200, // 200g scheduled
      goalId: dietGoalId,
    };

    const dietRes1 = await agent.post("/api/diet/createDiet").send(diet1);
    dietId1 = dietRes1.body.data._id;

    // Create second diet entry (lunch)
    const diet2 = {
      foodName: "Grilled Chicken Salad",
      meal: "lunch",
      calories: 450,
      carbs: 30,
      protein: 40,
      fat: 15,
      mealDateAndTime: today.toISOString(),
      mealWeight: 300, // 300g scheduled
      goalId: dietGoalId,
    };

    const dietRes2 = await agent.post("/api/diet/createDiet").send(diet2);
    dietId2 = dietRes2.body.data._id;

    // Create tracker entry for first diet (partial consumption)
    const tracker1 = {
      type: "diet",
      date: today.toISOString(),
      workoutOrDietData: {
        weightConsumed: 150, // Ate 150g out of 200g planned
      },
    };

    const trackerRes1 = await agent
      .post(`/api/tracker/addTracking/${dietId1}`)
      .send(tracker1);
    trackerId1 = trackerRes1.body.newTracker._id;

    // Create tracker entry for second diet (overconsumption)
    const tracker2 = {
      type: "diet",
      date: today.toISOString(),
      workoutOrDietData: {
        weightConsumed: 350, // Ate 350g out of 300g planned
      },
    };

    const trackerRes2 = await agent
      .post(`/api/tracker/addTracking/${dietId2}`)
      .send(tracker2);
    trackerId2 = trackerRes2.body.newTracker._id;
  });

  describe("GET /api/progress/DietGoalProgress/:goalId", () => {
    it("should get diet goal progress with tracking data", async () => {
      const res = await agent.get(
        `/api/progress/DietGoalProgress/${dietGoalId}`
      );

      console.log("Diet Goal Progress Response:");
      console.log(JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("progress");

      console.log("first failure");
      console.log(res.body);

      // Check progress structure
      expect(res.body.progress).toHaveProperty("calories");
      expect(res.body.progress).toHaveProperty("proteins");
      expect(res.body.progress).toHaveProperty("fats");
      expect(res.body.progress).toHaveProperty("carbs");
      expect(res.body.progress).toHaveProperty("overall");

      // Check calories data structure
      expect(res.body.progress.calories).toHaveProperty("target");
      expect(res.body.progress.calories).toHaveProperty("actual");
      expect(res.body.progress.calories).toHaveProperty("progress");
      expect(res.body.progress.calories).toHaveProperty("status");

      // Verify target values match goal
      expect(res.body.progress.calories.target).toBe(2000);
      expect(res.body.progress.proteins.target).toBe(150);
      expect(res.body.progress.fats.target).toBe(70);
      expect(res.body.progress.carbs.target).toBe(250);

      // Check calculated actual values
      // Diet 1: 350 cal * (150/200) = 262.5 cal
      // Diet 2: 450 cal * (350/300) = 525 cal
      // Total: 787.5 cal
      expect(res.body.progress.calories.actual).toBeCloseTo(787.5, 1);

      // Check progress percentage
      expect(res.body.progress.calories.progress).toBeCloseTo(39.38, 1); // 787.5/2000 * 100
    });

    it("should return 404 for non-existent goal", async () => {
      const invalidGoalId = new mongoose.Types.ObjectId();
      const res = await agent.get(
        `/api/progress/DietGoalProgress/${invalidGoalId}`
      );

      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid goal ID format", async () => {
      const res = await agent.get("/api/progress/DietGoalProgress/invalidId");

      expect(res.status).toBe(400);
    });

    it("should handle goal with no scheduled diets", async () => {
      // Create a new goal with no diets
      const emptyGoal = {
        category: "diet",
        startDate: today.toISOString(),
        targetDate: tomorrow.toISOString(),
        description: "Empty diet goal",
        status: "pending",
        data: {
          targetCalories: 1500,
          targetProteins: 100,
          targetFats: 50,
          targetCarbs: 200,
        },
      };

      const goalRes = await agent.post("/api/goal/add").send(emptyGoal);
      const emptyGoalId = goalRes.body.newGoal._id;

      const res = await agent.get(
        `/api/progress/DietGoalProgress/${emptyGoalId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("No diet has been scheduled");
      expect(res.body.progress).toEqual({});
    });
  });

  describe("GET /api/progress/DietGraphProgress", () => {
    it("should get day view diet graph progress", async () => {
      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "day" });

      console.log("Day View Graph Progress:");
      console.log(JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("dateRange");

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1); // Single day

      const dayData = res.body.data[0];
      expect(dayData).toHaveProperty("date");
      expect(dayData).toHaveProperty("scheduled");
      expect(dayData).toHaveProperty("actual");
      expect(dayData).toHaveProperty("adherence");

      // Check scheduled totals (350 + 450 = 800 calories)
      expect(dayData.scheduled.calories).toBe(800);
      expect(dayData.scheduled.proteins).toBe(52); // 12 + 40
      expect(dayData.scheduled.fats).toBe(23); // 8 + 15
      expect(dayData.scheduled.carbs).toBe(90); // 60 + 30

      // Check actual consumption
      expect(dayData.actual.calories).toBeCloseTo(787.5, 1);
      expect(dayData.actual.proteins).toBeCloseTo(55.67, 1); // (12*0.75) + (40*1.167)
    });

    it("should get week view diet graph progress", async () => {
      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "week" });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(7); // 7 days
      expect(res.body.dateRange.viewType).toBe("week");

      console.log("Week view");
      console.log(JSON.stringify(res.body));

      // Should have data for today and empty data for other days
      const todayData = res.body.data.find(
        (d: any) => d.date === today.toISOString().split("T")[0]
      );
      expect(todayData).toBeDefined();
      expect(todayData.scheduled.calories).toBeGreaterThan(0);

      // Other days should have zero scheduled data
      const emptyDays = res.body.data.filter(
        (d: any) => d.date !== today.toISOString().split("T")[0]
      );
      expect(emptyDays.length).toBe(6);
      expect(emptyDays[0].scheduled.calories).toBe(0);
    });

    it("should get month view diet graph progress", async () => {
      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "month" });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(28); // At least 28 days
      expect(res.body.data.length).toBeLessThanOrEqual(31); // At most 31 days
      expect(res.body.dateRange.viewType).toBe("month");
    });
  });

  describe("Progress Calculations Accuracy", () => {
    it("should calculate correct progress with partial consumption", async () => {
      const res = await agent.get(
        `/api/progress/DietGoalProgress/${dietGoalId}`
      );

      // Expected calculations:
      // Diet 1: 350 cal, 200g scheduled, 150g consumed (ratio: 0.75)
      // Actual calories from diet 1: 350 * 0.75 = 262.5
      // Diet 2: 450 cal, 300g scheduled, 350g consumed (ratio: 1.167)
      // Actual calories from diet 2: 450 * 1.167 = 525
      // Total actual: 262.5 + 525 = 787.5
      // Progress: 787.5 / 2000 * 100 = 39.38%

      expect(res.body.progress.calories.actual).toBeCloseTo(787.5, 1);
      expect(res.body.progress.calories.progress).toBeCloseTo(39.38, 1);
      expect(res.body.progress.calories.status).toBe("on_track");
    });

    it("should handle overconsumption correctly", async () => {
      // The second diet has overconsumption (350g eaten vs 300g planned)
      const res = await agent.get(
        `/api/progress/DietGoalProgress/${dietGoalId}`
      );

      // Proteins: Diet 1: 12 * 0.75 = 9, Diet 2: 40 * 1.167 = 46.68
      // Total proteins: 9 + 46.68 = 55.68
      expect(res.body.progress.proteins.actual).toBeCloseTo(55.68, 1);
    });

    it("should show correct adherence percentages in graph data", async () => {
      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "day" });

      const dayData = res.body.data[0];

      // Adherence = (actual / scheduled) * 100
      // Calories: 787.5 / 800 * 100 = 98.44%
      expect(dayData.adherence.calories).toBeCloseTo(98.44, 1);

      // Should have adherence data since tracking exists
      expect(dayData.adherence.calories).not.toBe(null);
      expect(dayData.adherence.proteins).not.toBe(null);
    });
  });

  describe("Edge Cases", () => {
    it("should handle goal with scheduled diets but no tracking", async () => {
      // Create new goal and diet without tracking
      const unTrackedGoal = {
        category: "diet",
        startDate: today.toISOString(),
        targetDate: tomorrow.toISOString(),
        description: "Untracked diet goal",
        status: "pending",
        data: {
          targetCalories: 1800,
          targetProteins: 120,
          targetFats: 60,
          targetCarbs: 200,
        },
      };

      const goalRes = await agent.post("/api/goal/add").send(unTrackedGoal);
      const unTrackedGoalId = goalRes.body.newGoal._id;

      // Create diet but don't track it
      const untrackedDiet = {
        foodName: "Untracked Meal",
        meal: "dinner",
        calories: 500,
        carbs: 50,
        protein: 30,
        fat: 20,
        mealDateAndTime: today.toISOString(),
        mealWeight: 250,
        goalId: unTrackedGoalId,
      };

      await agent.post("/api/diet/createDiet").send(untrackedDiet);

      const res = await agent.get(
        `/api/progress/DietGoalProgress/${unTrackedGoalId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("No tracking data found");
      expect(res.body.progress).toEqual({});
    });

    it("should handle zero mealWeight in calculations", async () => {
      // Create diet with zero weight
      const zeroWeightDiet = {
        foodName: "Zero Weight Food",
        meal: "snack",
        calories: 100,
        carbs: 20,
        protein: 5,
        fat: 2,
        mealDateAndTime: today.toISOString(),
        mealWeight: 0, // Zero weight
        goalId: dietGoalId,
      };

      const dietRes = await agent
        .post("/api/diet/createDiet")
        .send(zeroWeightDiet);
      const zeroWeightDietId = dietRes.body.data._id;

      // Try to track it
      const tracker = {
        type: "diet",
        date: today.toISOString(),
        workoutOrDietData: {
          weightConsumed: 50,
        },
      };

      await agent
        .post(`/api/tracker/addTracking/${zeroWeightDietId}`)
        .send(tracker);

      // Should still work without division by zero errors
      const res = await agent.get(
        `/api/progress/DietGoalProgress/${dietGoalId}`
      );
      expect(res.status).toBe(200);
    });

    it("should handle non-diet category goal", async () => {
      // Create a workout goal instead of diet goal
      const workoutGoal = {
        category: "workout",
        startDate: today.toISOString(),
        targetDate: tomorrow.toISOString(),
        description: "Exercise goal",
        status: "pending",
        data: {
          exerciseName: "Running",
          targetMinutes: 30,
        },
      };

      const goalRes = await agent.post("/api/goal/add").send(workoutGoal);
      const workoutGoalId = goalRes.body.newGoal._id;

      const res = await agent.get(
        `/api/progress/DietGoalProgress/${workoutGoalId}`
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Category must be diet");
    });
  });

  describe("Graph Progress Date Ranges", () => {
    it("should return correct date range for day view", async () => {
      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "day" });

      const startDate = new Date(res.body.dateRange.start);
      const endDate = new Date(res.body.dateRange.end);

      // Should be exactly 1 day difference
      const diffInDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBe(1);
    });

    it("should return correct date range for week view", async () => {
      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "week" });

      const startDate = new Date(res.body.dateRange.start);
      const endDate = new Date(res.body.dateRange.end);

      // Should be exactly 7 days difference
      const diffInDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBe(7);
    });

    it("should fill missing dates correctly", async () => {
      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "week" });

      // Should have 7 consecutive dates
      expect(res.body.data.length).toBe(7);

      // Dates should be consecutive
      for (let i = 1; i < res.body.data.length; i++) {
        const prevDate = new Date(res.body.data[i - 1].date);
        const currDate = new Date(res.body.data[i].date);
        const diffInDays =
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffInDays).toBe(1);
      }

      // Days without scheduled meals should have zero scheduled values
      const daysWithoutMeals = res.body.data.filter(
        (d: any) => d.scheduled.calories === 0
      );
      expect(daysWithoutMeals.length).toBeGreaterThan(0);

      // Days without meals should have null actual values
      daysWithoutMeals.forEach((day: any) => {
        expect(day.actual.calories).toBe(null);
        expect(day.adherence.calories).toBe(null);
      });
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle mixed tracking (some meals tracked, some not)", async () => {
      // Create a new diet for today but don't track it
      const untrackedDiet = {
        foodName: "Evening Snack",
        meal: "snack",
        calories: 200,
        carbs: 30,
        protein: 5,
        fat: 8,
        mealDateAndTime: today.toISOString(),
        mealWeight: 100,
        goalId: dietGoalId,
      };

      await agent.post("/api/diet/createDiet").send(untrackedDiet);

      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "day" });

      const dayData = res.body.data[0];

      // Scheduled should include all meals (including untracked)
      expect(dayData.scheduled.calories).toBe(1600); // 350 + 450 + 200
    });

    it("should handle multiple days with different tracking patterns", async () => {
      // Create diet for yesterday (without tracking)
      const yesterdayDiet = {
        foodName: "Yesterday Meal",
        meal: "lunch",
        calories: 400,
        carbs: 40,
        protein: 20,
        fat: 15,
        mealDateAndTime: yesterday.toISOString(),
        mealWeight: 200,
        goalId: dietGoalId,
      };

      await agent.post("/api/diet/createDiet").send(yesterdayDiet);

      const res = await agent
        .get("/api/progress/DietGraphProgress")
        .query({ viewType: "week" });

      // Find yesterday's data
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const yesterdayData = res.body.data.find(
        (d: any) => d.date === yesterdayStr
      );

      if (yesterdayData) {
        expect(yesterdayData.scheduled.calories).toBe(400);
        expect(yesterdayData.actual.calories).toBe(null); // No tracking
        expect(yesterdayData.adherence.calories).toBe(null);
      }
    });
  });

  afterAll(async () => {
    // Clean up test data if needed
    // Note: If using a test database, this might not be necessary
  });
});
