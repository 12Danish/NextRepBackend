import { getGoalsController } from "../../controllers/goalControllers";
import { registerAndLoginUser } from "../testUtils";
import mongoose from "mongoose";

describe("Get Goals Tests", () => {
  let agent: any;
  let firstGoalId: string;
  let secondGoalId: string;

  beforeAll(async () => {
    // Register and login user
    agent = await registerAndLoginUser();

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(
      today.getTime() + 2 * 24 * 60 * 60 * 1000
    );

    // Create multiple goals for testing
    const goalsData = [
      {
        category: "weight",
        startDate: today.toISOString(),
        
        targetDate: tomorrow.toISOString(),
        description: "Lose 5kg",
        status: "pending",
        data: {
          goalType: "loss",
          targetWeight: 70,
          currentWeight: 75,
          previousWeights: [{ weight: 75, date: today }],
        },
      },
      {
        category: "workout",
        startDate: today.toISOString(),
        
        targetDate: tomorrow.toISOString(),
        description: "Run 30 minutes daily",
        status: "completed",
        data: {
          exerciseName: "Running",
          targetMinutes: 30,
        },
      },
      {
        category: "weight",
        startDate: today.toISOString(),
       
        targetDate: tomorrow.toISOString(),
        description: "Lose 3kg",
        status: "completed",
        data: {
          goalType: "loss",
          targetWeight: 72,
          currentWeight: 72,
          previousWeights: [{ weight: 75, date: today }],
        },
      },
    ];

    // Add multiple goals
    for (const goalData of goalsData) {
      await agent.post("/api/goal/add").send(goalData);
    }
  });

  it("Should return all goals for the user", async () => {
    const getGoalsRes = await agent.get("/api/goal/getGoals");

    expect(getGoalsRes.status).toBe(200);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
    expect(getGoalsRes.body.goalsData.goals.length).toBeGreaterThan(0);

    // Store first goal ID for later tests
    firstGoalId = getGoalsRes.body.goalsData.goals[0]?._id;
    secondGoalId = getGoalsRes.body.goalsData.goals[1]?._id;

    expect(firstGoalId).toBeTruthy();
    expect(secondGoalId).toBeTruthy();
  });

  it("Should filter goals by category", async () => {
    const getGoalsRes = await agent.get("/api/goal/getGoals?category=weight");

    expect(getGoalsRes.status).toBe(200);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
    expect(getGoalsRes.body.goalsData.goals.length).toBe(2); // Should return 2 weight goals
    expect(
      getGoalsRes.body.goalsData.goals.every((goal: any) => goal.category === "weight")
    ).toBe(true);
  });

  it("Should filter goals by status", async () => {
    const getGoalsRes = await agent.get("/api/goal/getGoals?status=completed");
    const getAllGoalsRes = await agent.get("/api/goal/getGoals");
    expect(getGoalsRes.status).toBe(200);
    console.log("Getting goals by status");
    console.log(getGoalsRes.body);
    console.log("These are all goals in db ");
    console.log(getAllGoalsRes.body);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
    expect(getGoalsRes.body.goalsData.goals.length).toBe(2); // Should return 2 completed goals
    expect(
      getGoalsRes.body.goalsData.goals.every((goal: any) => goal.status === "completed")
    ).toBe(true);
  });

  it("Should filter goals by both category and status", async () => {
    const getGoalsRes = await agent.get(
      "/api/goal/getGoals?category=weight&status=completed"
    );

    expect(getGoalsRes.status).toBe(200);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
    expect(getGoalsRes.body.goalsData.goals.length).toBe(1); // Should return 1 goal (weight + completed)
    expect(getGoalsRes.body.goalsData.goals[0].category).toBe("weight");
    expect(getGoalsRes.body.goalsData.goals[0].status).toBe("completed");
  });

  it("Should handle pagination correctly", async () => {
    const getGoalsRes = await agent.get("/api/goal/getGoals?page=1&limit=2");

    expect(getGoalsRes.status).toBe(200);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
    expect(getGoalsRes.body.goalsData.goals.length).toBe(2); // Should return 2 goals per page
  });

  it("Should return second page of goals", async () => {
    const getGoalsRes = await agent.get("/api/goal/getGoals?page=2&limit=2");

    expect(getGoalsRes.status).toBe(200);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
    expect(getGoalsRes.body.goalsData.goals.length).toBeLessThanOrEqual(2); // Last page might have fewer items
  });

  it("Should handle invalid page number gracefully", async () => {
    const getGoalsRes = await agent.get("/api/goal/getGoals?page=0");

    expect(getGoalsRes.status).toBe(200);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
  });

  it("Should handle invalid limit gracefully", async () => {
    const getGoalsRes = await agent.get("/api/goal/getGoals?limit=0");

    expect(getGoalsRes.status).toBe(200);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
  });

  it("Should return empty array when no goals match the filter", async () => {
    const getGoalsRes = await agent.get(
      "/api/goal/getGoals?category=nonexistent"
    );

    expect(getGoalsRes.status).toBe(200);
    expect(getGoalsRes.body.message).toBe("Goals fetched");
    expect(Array.isArray(getGoalsRes.body.goalsData.goals)).toBe(true);
    expect(getGoalsRes.body.goalsData.goals.length).toBe(0);
  });

  it("should get the count of all goals", async () => {
    const goalsCountRes = await agent.get("/api/goal/getGoalsCounter");

    expect(goalsCountRes.status).toBe(200);
    expect(goalsCountRes.body.goalsCount).toBe(3);
  });

  it("Should get the count of goals according to specified standard or category", async () => {
    const goalsCountRes = await agent.get(
      "/api/goal/getGoalsCounter?status=completed"
    );

    expect(goalsCountRes.status).toBe(200);
    expect(goalsCountRes.body.goalsCount).toBe(2);
  });

  it("Should get the overall progress", async () => {
    const goalProgRes = await agent.get("/api/goal/getOverallProgress");
    console.log("progress");

    console.log(goalProgRes.body);

    expect(goalProgRes.status).toBe(200);

    expect(goalProgRes.body.progress).toBeTruthy();
  });

  it("Should only return the goals which are pending and target date is gte to today", async () => {
    const upcomingGoalsRes = await agent.get("/api/goal/getUpcomingGoals");

    expect(upcomingGoalsRes.status).toBe(200);

    expect(upcomingGoalsRes.body.goals.length).toBe(1);
  });
});
