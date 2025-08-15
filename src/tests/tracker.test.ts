import { registerAndLoginUser } from "./testUtils";
import mongoose from "mongoose";

describe("Tracker Routes Suite", () => {
  let agent: any;
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  let workoutId: any;
  let dietId: any;
  let sleepId: any;

  beforeAll(async () => {
    agent = await registerAndLoginUser();

    // Registering workout Goal
    const workoutGoal = {
      category: "workout",
      startDate: today.toISOString(),
      targetDate: tomorrow.toISOString(),
      description: "Run 30 minutes daily",
      status: "pending",
      data: {
        exerciseName: "Running",
        targetMinutes: 30,
      },
    };

    const goalRes = await agent.post("/api/goal/add").send(workoutGoal);
    const workoutGoalId = goalRes.body.newGoal._id;

    // Creating Workout Entry
    const newWorkoutRes = await agent.post("/api/workout/create").send({
      exerciseName: "Bench Press",
      type: "weight lifting",
      reps: 10,
      duration: null,
      targetMuscleGroup: ["chest"],
      goalId: workoutGoalId,
      workoutDateAndTime: today.toISOString(),
    });

    workoutId = newWorkoutRes.body.newWorkout._id;

    // Registering Diet Goal
    const dietGoal = {
      category: "diet",
      startDate: today.toISOString(),
      targetDate: tomorrow.toISOString(),
      description: "Maintain balanced diet",
      status: "pending",
      data: {
        targetCalories: 2000,
        targetProteins: 100,
        targetFats: 70,
        targetCarbs: 250,
      },
    };

    const dietGoalRes = await agent.post("/api/goal/add").send(dietGoal);
    const dietGoalId = dietGoalRes.body.newGoal._id;

    // Creating Diet Entry
    const dietRes = await agent.post("/api/diet/createDiet").send({
      foodName: "Oatmeal Breakfast",
      meal: "breakfast",
      calories: 350,
      carbs: 50,
      protein: 10,
      fat: 5,
      mealDateAndTime: today.toISOString(),
      mealWeight: 200,
      goalId: dietGoalId,
    });

    dietId = dietRes.body.data._id;

    // Creating Sleep Goal Entry
    const sleepGoalData = {
      category: "sleep",
      startDate: today.toISOString(),
      targetDate: tomorrow.toISOString(),
      description: "Get 8 hours of sleep",
      status: "pending",
      data: {
        targetHours: 8,
      },
    };

    const sleepGoalRes = await agent.post("/api/goal/add").send(sleepGoalData);
    const sleepGoalId = sleepGoalRes.body.newGoal._id;

    // Creating Sleep Entry
    const sleepRes = await agent.post("/api/sleep/create").send({
      duration: 480, // minutes
      date: today.toISOString(),
      goalId: sleepGoalId,
    });

    sleepId = sleepRes.body.data._id;
  });

  describe("POST /api/tracker/addTracking/:referenceId", () => {
    it("should add a new workout tracker entry", async () => {
      const trackerData = {
        type: "workout",
        date: today.toISOString(),
        workoutOrDietData: {
          completedReps: 8,
          completedTime: 30,
        },
      };

      const res = await agent
        .post(`/api/tracker/addTracking/${workoutId}`)
        .send(trackerData);

      console.log("This is the route for adding new workout tracker entry");
      console.log(res.body);
      console.log(`Workout id : ${workoutId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Tracker successfully added");
      expect(res.body.newTracker).toHaveProperty("type", "workout");
      expect(res.body.newTracker).toHaveProperty("referenceId", workoutId);
      expect(res.body.newTracker.completedReps).toBe(8);
      expect(res.body.newTracker.completedTime).toBe(30);
    });

    it("should add a new diet tracker entry", async () => {
      const trackerData = {
        type: "diet",
        date: today.toISOString(),
        workoutOrDietData: {
          weightConsumed: 150,
        },
      };

      const res = await agent
        .post(`/api/tracker/addTracking/${dietId}`)
        .send(trackerData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Tracker successfully added");
      expect(res.body.newTracker).toHaveProperty("type", "diet");
      expect(res.body.newTracker).toHaveProperty("referenceId", dietId);
      expect(res.body.newTracker.weightConsumed).toBe(150);
    });

    it("should add a new sleep tracker entry", async () => {
      const trackerData = {
        type: "sleep",
        date: today.toISOString(),
        workoutOrDietData: {},
      };

      const res = await agent
        .post(`/api/tracker/addTracking/${sleepId}`)
        .send(trackerData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Tracker successfully added");
      expect(res.body.newTracker).toHaveProperty("type", "sleep");
      expect(res.body.newTracker).toHaveProperty("referenceId", sleepId);
    });

    it("should return 400 for invalid referenceId", async () => {
      const trackerData = {
        type: "workout",
        date: today.toISOString(),
        workoutOrDietData: {
          completedReps: 8,
        },
      };

      const res = await agent
        .post("/api/tracker/addTracking/invalidId")
        .send(trackerData);

      expect(res.status).toBe(400);
    
    });
  });

  describe("GET /api/tracker/getTracked", () => {
    beforeAll(async () => {
      // Add a tracker entry for testing GET
      await agent.post(`/api/tracker/addTracking/${workoutId}`).send({
        type: "workout",
        date: today.toISOString(),
        workoutOrDietData: {
          completedReps: 8,
          completedTime: 30,
        },
      });
    });

    it("should retrieve tracked data for a specific date", async () => {
      const res = await agent.get("/api/tracker/getTracked").query({
        date: today.toISOString(),
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Successfully retrieved tracked data for the provided date"
      );
      expect(res.body.trackedData).toBeInstanceOf(Array);
      expect(res.body.trackedData.length).toBeGreaterThan(0);
      expect(res.body.trackedData[0]).toHaveProperty("type");
      expect(res.body.trackedData[0]).toHaveProperty("referenceId");
    });

    it("should return empty array if no data for date", async () => {
      const futureDate = new Date(
        today.getTime() + 2 * 24 * 60 * 60 * 1000
      ).toISOString();
      const res = await agent.get("/api/tracker/getTracked").query({
        date: futureDate,
      });

      expect(res.status).toBe(200);
      expect(res.body.trackedData).toEqual([]);
    });
  });

  describe("PUT /api/tracker/updateTracking/:trackerId", () => {
    let trackerId: any;

    beforeAll(async () => {
      // Create a tracker entry to update
      const trackerRes = await agent
        .post(`/api/tracker/addTracking/${workoutId}`)
        .send({
          type: "workout",
          date: today.toISOString(),
          workoutOrDietData: {
            completedReps: 8,
            completedTime: 30,
          },
        });
      trackerId = trackerRes.body.newTracker._id;
    });

    it("should update a tracker entry", async () => {
      const updates = {
        updates: {
          completedReps: 12,
          completedTime: 45,
        },
      };

      const res = await agent
        .put(`/api/tracker/updateTracking/${trackerId}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Tracker updated successfully"
      );
      expect(res.body.updatedTracker.completedReps).toBe(12);
      expect(res.body.updatedTracker.completedTime).toBe(45);
    });

    it("should return 400 for invalid trackerId", async () => {
      const updates = {
        updates: {
          completedReps: 12,
        },
      };

      const res = await agent
        .put("/api/tracker/updateTracking/invalidId")
        .send(updates);

      expect(res.status).toBe(400);
    
    });
  });

  describe("DELETE /api/tracker/deleteTracking/:trackerId", () => {
    let trackerId: any;

    beforeAll(async () => {
      // Create a tracker entry to delete
      const trackerRes = await agent
        .post(`/api/tracker/addTracking/${workoutId}`)
        .send({
          type: "workout",
          date: today.toISOString(),
          workoutOrDietData: {
            completedReps: 8,
            completedTime: 30,
          },
        });
      trackerId = trackerRes.body.newTracker._id;
    });

    it("should delete a tracker entry", async () => {
      const res = await agent.delete(`/api/tracker/deleteTracking/${trackerId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Tracked value successfully deleted"
      );

      // Verify deletion
      const getRes = await agent.get("/api/tracker/getTracked").query({
        date: today.toISOString(),
      });
      expect(
        getRes.body.trackedData.some((t: any) => t._id === trackerId)
      ).toBeFalsy();
    });

    it("should return 400 for invalid trackerId", async () => {
      const res = await agent.delete("/api/tracker/deleteTracking/invalidId");

      expect(res.status).toBe(400);
     
    });
  });
});
