import { registerAndLoginUser } from "../testUtils";
import mongoose from "mongoose";

describe("Update Goals Test suite", () => {
  let agent: any;
  let goalIds: string[] = [];

  beforeAll(async () => {
    agent = await registerAndLoginUser();

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(
      today.getTime() + 2 * 24 * 60 * 60 * 1000
    );

    const goalsData = [
      {
        category: "weight",
        startDate: today.toISOString(),
        targetDate: dayAfterTomorrow.toISOString(),
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

    for (const goalData of goalsData) {
      const response = await agent.post("/api/goal/add").send(goalData);
      console.log(response.body);
      goalIds.push(response.body.newGoal._id);
    }
  });

  it("should update the data with the new content", async () => {
    const goalId = goalIds[0];
    const updates = {
      description: "Lose 6kg",
      targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      data: {
        currentWeight: 74,
        previousWeights: [
          { weight: 75, date: new Date() },
          { weight: 74, date: new Date() },
        ],
      },
    };

    const response = await agent
      .put(`/api/goal/update/${goalId}`)
      .send(updates)
      .expect(200);

    expect(response.body.message).toBe("Goal updated successfully.");
    expect(response.body.data).toMatchObject({
      _id: goalId,
      description: updates.description,
      targetDate: updates.targetDate,
      data: expect.objectContaining({
        currentWeight: 74,
        previousWeights: expect.arrayContaining([
          expect.objectContaining({ weight: 74 }),
        ]),
      }),
    });
  });

  it("should return 400 for invalid goal ID", async () => {
    const invalidGoalId = "invalid-id";
    const updates = {
      description: "Lose 6kg",
    };

    const response = await agent
      .put(`/api/goal/update/${invalidGoalId}`)
      .send(updates)
      .expect(400);

    expect(response.body.message).toBe("Invalid goal ID");
  });

  it("should return 404 for non-existent goal ID", async () => {
    const nonExistentGoalId = new mongoose.Types.ObjectId().toString();
    const updates = {
      description: "Lose 6kg",
    };

    const response = await agent
      .put(`/api/goal/update/${nonExistentGoalId}`)
      .send(updates)
      .expect(404);

    expect(response.body.message).toBe("Goal not found");
  });

  it("should return 400 when attempting to update category field", async () => {
    const goalId = goalIds[0];
    const updates = {
      category: "nutrition",
      description: "Lose 6kg",
    };

    const response = await agent
      .put(`/api/goal/update/${goalId}`)
      .send(updates)
      .expect(400);

    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors).toEqual([
      { message: "Category field cannot be updated" },
    ]);
  });

  it("should update nested data fields correctly", async () => {
    const goalId = goalIds[1];
    const updates = {
      data: {
        exerciseName: "Cycling",
        targetMinutes: 45,
      },
    };

    const response = await agent
      .put(`/api/goal/update/${goalId}`)
      .send(updates)
      .expect(200);

    expect(response.body.message).toBe("Goal updated successfully.");
    expect(response.body.data.data).toMatchObject({
      exerciseName: "Cycling",
      targetMinutes: 45,
    });
  });

  it("should handle empty updates gracefully", async () => {
    const goalId = goalIds[0];
    const updates = {};

    const response = await agent
      .put(`/api/goal/update/${goalId}`)
      .send(updates)
      .expect(200);

    expect(response.body.message).toBe("Goal updated successfully.");
    expect(response.body.data._id).toBe(goalId);
  });

  it("should update overdue status of pending goals with past targetDate", async () => {
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

    // Add a pending goal with a past targetDate
    const overdueGoal = {
      category: "weight",
      startDate: new Date().toISOString(),
      targetDate: pastDate.toISOString(),
      description: "This goal should become overdue",
      status: "pending",
      data: {
        goalType: "loss",
        targetWeight: 70,
        currentWeight: 75,
        previousWeights: [{ weight: 75, date: new Date() }],
      },
    };

    const response = await agent.post("/api/goal/add").send(overdueGoal);
    const overdueGoalId = response.body.newGoal._id;

    // Call the updateGoalsOverdueStatus endpoint
    const statusUpdateResponse = await agent
      .get("/api/goal/updateGoalsOverdueStatus")
      .expect(200);

    expect(statusUpdateResponse.body.message).toBe(
      "Goal statuses successfully updated"
    );

    // Fetch the updated goal to verify the status is now "overdue"
    const getUpdatedGoal = await agent.get(`/api/goal/${overdueGoalId}`);
    const goalsRes = await agent.get(`/api/goal/getGoals`);

    const goals = goalsRes.body.goals;

    for (const goal of goals) {
      if (goal._id == overdueGoalId) {
        expect(goal.status).toBe("overdue");
      }
    }
  });

  it("Should toggle the status of goals", async () => {
    const res = await agent.get(
      `/api/goal/changeCompletionStatus/${goalIds[0]}?currentStatus=pending`
    );

    console.log(res);

    expect(res.status).toBe(200);
    expect(res.body.goal.status).toBe("completed");
  });
});
