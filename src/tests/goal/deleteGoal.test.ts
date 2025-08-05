import { registerAndLoginUser } from "../testUtils";

describe("Delete Goals Tests", () => {
  let agent: any;
  let firstGoalId: string;
  beforeAll(async () => {
    agent = await registerAndLoginUser();
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const weightGoalData = {
      category: "weight",
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
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

    const getGoalsRes = await agent.get("/api/goal/getGoals");
    console.log("Goals res");
    console.log(getGoalsRes.status);
    console.log(getGoalsRes.body);

    // Access the goals array and extract _id
    const goals = getGoalsRes.body.goals;
    console.log(goals);
    firstGoalId = goals[0]?._id;
  });

  it("Should delete goal when given goal Id", async () => {
    const deleteRes = await agent.delete(`/api/goal/delete/${firstGoalId}`);

    expect(deleteRes.status).toBe(200);
  });

  it("Should fail with non existant id", async () => {
    const deleteRes = await agent.delete(`/api/goal/delete/123`);

    expect(deleteRes.status).toBe(400);
  });
});
