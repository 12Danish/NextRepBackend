import { registerAndLoginUser } from "../testUtils";
import Sleep from "../../models/SleepModel";

describe("Delete Goals Tests", () => {
  let agent: any;
  let firstGoalId: string;
  let sleepGoalId: string;
  
  beforeAll(async () => {
    agent = await registerAndLoginUser();
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const weightGoalData = {
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
    };
    await agent.post("/api/goal/add").send(weightGoalData);

    // Add a sleep goal to test sleep record deletion
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
    sleepGoalId = sleepGoalRes.body.newGoal._id;

    const getGoalsRes = await agent.get("/api/goal/getGoals");
    console.log("Goals res");
    console.log(getGoalsRes.status);
    console.log(getGoalsRes.body);

    // Access the goals array and extract _id
    const goals = getGoalsRes.body.goalsData.goals;
    console.log(goals);
    firstGoalId = goals[0]?._id;
  });

  it("Should delete goal when given goal Id", async () => {
    const deleteRes = await agent.delete(`/api/goal/delete/${firstGoalId}`);

    expect(deleteRes.status).toBe(200);
  });

  it("Should delete sleep goal and associated sleep records", async () => {
    // Verify sleep record exists before deletion
    const sleepRecordBefore = await Sleep.findOne({ goalId: sleepGoalId });
    expect(sleepRecordBefore).toBeTruthy();

    const deleteRes = await agent.delete(`/api/goal/delete/${sleepGoalId}`);
    expect(deleteRes.status).toBe(200);

    // Verify sleep record is also deleted
    const sleepRecordAfter = await Sleep.findOne({ goalId: sleepGoalId });
    expect(sleepRecordAfter).toBeFalsy();
  });

  it("Should fail with non existant id", async () => {
    const deleteRes = await agent.delete(`/api/goal/delete/123`);

    expect(deleteRes.status).toBe(400);
  });
});
