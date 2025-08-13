import { registerAndLoginUser } from "./testUtils";

describe("Sleep Tests Suite", () => {
  let agent: any;
  let sleepGoalId: string;
  let sleepId: string;

  beforeAll(async () => {
    // 1. Register & login user
    agent = await registerAndLoginUser();

    // 2. Create a workout goal
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

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

    const res = await agent.post("/api/goal/add").send(sleepGoalData);
    console.log(res.body);
    sleepGoalId = res.body.newGoal._id;
  });

  it("Should create a sleep entry", async () => {
    const today = new Date();

    const res = await agent.post("/api/sleep/create").send({
      duration: 480, // 8 hours in minutes
      date: today.toISOString(),
      goalId: sleepGoalId,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sleep entry created successfully");
    expect(res.body.data).toHaveProperty("_id");
    sleepId = res.body.data._id;
  });

  it("Should get sleep entries for 'day' viewType with offset 0", async () => {
    const res = await agent
      .get("/api/sleep/getSleep")
      .query({ viewType: "day", offset: 0 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sleep entries retrieved successfully");
    console.log("sleep data");
    console.log(res.body);
    expect(res.body.data.sleepEntries.length).toBe(1);
  });

  it("Should get sleep entries for 'week' viewType with offset -1", async () => {
    const prevWeekDate = new Date();
    prevWeekDate.setDate(prevWeekDate.getDate() - 7); // one week ago

    await agent.post("/api/sleep/create").send({
      date: prevWeekDate,
      duration: 6.5,
    });

    const res = await agent
      .get("/api/sleep/getSleep")
      .query({ viewType: "week", offset: -1 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sleep entries retrieved successfully");
    expect(res.body.data.sleepEntries.length).toBe(1);
  });

  it("Should get sleep entries for 'month' viewType with offset 1", async () => {
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1); // next month

    await agent.post("/api/sleep/create").send({
      date: nextMonthDate,
      duration: 8,
    });

    const res = await agent
      .get("/api/sleep/getSleep")
      .query({ viewType: "month", offset: 1 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sleep entries retrieved successfully");
    expect(res.body.data.sleepEntries.length).toBe(1);
  });

  it("Should update the sleep entry", async () => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 1);

    const res = await agent.patch(`/api/sleep/update/${sleepId}`).send({
      duration: 420, // 7 hours
      date: newDate.toISOString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sleep entry updated successfully");
    expect(res.body.data.duration).toBe(420);
  });

  it("Should delete the sleep entry", async () => {
    const res = await agent.delete(`/api/sleep/delete/${sleepId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sleep entry deleted successfully");
  });

  it("Should return 404 when deleting non-existing sleep", async () => {
    const res = await agent.delete(`/api/sleep/delete/${sleepId}`);
    expect(res.status).toBe(404);
  });
});
