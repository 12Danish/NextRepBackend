import { registerAndLoginUser } from "./testUtils";

describe("Sleep Tests Suite", () => {
  let agent: any;
  let sleepGoalId: string;
  let sleepId: string;
  let userId: string;

  beforeAll(async () => {
    // 1. Register & login user
    agent = await registerAndLoginUser();
    userId = agent.userId; // assuming registerAndLoginUser sets this

    // 2. Create a sleep goal
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const sleepGoalData = {
      category: "sleep",
      startDate: today.toISOString(),
      targetDate: tomorrow.toISOString(),
      description: "Get 8 hours of sleep",
      status: "pending",
      data: { targetHours: 8 },
    };

    const res = await agent.post("/api/goal/add").send(sleepGoalData);
    sleepGoalId = res.body.newGoal._id;
  });

  it("Should create a sleep entry for today", async () => {
    const today = new Date();
    const res = await agent.post("/api/sleep/create").send({
      duration: 480, // minutes
      date: today.toISOString(),
      goalId: sleepGoalId,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Sleep entry created successfully");
    expect(res.body.data).toHaveProperty("_id");
    sleepId = res.body.data._id;
  });

  it("Should get sleep for 'day' viewType with particularDate", async () => {
    const today = new Date().toISOString();
    const res = await agent.get("/api/sleep/getSleep").query({
      viewType: "day",
      offset: 0,
      particularDate: today,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(1);
    expect(res.body.data.sleepEntries.length).toBe(1);
    expect(res.body.data.prev).toBe(false);
    expect(res.body.data.next).toBe(false);
  });

  it("Should show prev=true when older sleep exists", async () => {
    const prevDay = new Date();
    prevDay.setDate(prevDay.getDate() - 3);

    await agent.post("/api/sleep/create").send({
      date: prevDay.toISOString(),
      duration: 420,
    });

    const res = await agent.get("/api/sleep/getSleep").query({
      viewType: "day",
      offset: 0,
      particularDate: new Date().toISOString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.data.prev).toBe(true);
  });

  it("Should show next=true when newer sleep exists", async () => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 3);

    await agent.post("/api/sleep/create").send({
      date: nextDay.toISOString(),
      duration: 500,
    });

    const res = await agent.get("/api/sleep/getSleep").query({
      viewType: "day",
      offset: 0,
      particularDate: new Date().toISOString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.data.next).toBe(true);
  });

  it("Should get sleep for 'week' viewType with particularDate", async () => {
    const res = await agent.get("/api/sleep/getSleep").query({
      viewType: "week",
      offset: 0,
      particularDate: new Date().toISOString(),
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.sleepEntries)).toBe(true);
  });

  it("Should get sleep for 'month' viewType with particularDate", async () => {
    const res = await agent.get("/api/sleep/getSleep").query({
      viewType: "month",
      offset: 0,
      particularDate: new Date().toISOString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.data.start).toBeDefined();
    expect(res.body.data.end).toBeDefined();
    expect(res.body.data.count).toBeGreaterThan(0);
  });

  it("Should update the sleep entry", async () => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 1);

    const res = await agent.patch(`/api/sleep/update/${sleepId}`).send({
      duration: 420,
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
