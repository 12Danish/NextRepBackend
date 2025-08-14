import { registerAndLoginUser } from "./testUtils";

describe("Diet Tests Suite", () => {
  let agent: any;
  let dietGoalId: string;
  let createdDietId: string;

  beforeAll(async () => {
    // Register & login user
    agent = await registerAndLoginUser();

    // Create a diet goal for linking diets
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

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

    const res = await agent.post("/api/goal/add").send(dietGoal);
    dietGoalId = res.body.newGoal._id;
  });

  it("Should create a new diet entry", async () => {
    const dietEntry = {
      foodName: "Grilled Chicken Salad",
      meal: "lunch",
      calories: 450,
      carbs: 30,
      protein: 40,
      fat: 15,
      mealDateAndTime: new Date().toISOString(),
      mealWeight: 300,
      goalId: dietGoalId,
    };

    const res = await agent.post("/api/diet/createDiet").send(dietEntry);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Diet entry created successfully");
    expect(res.body.data.foodName).toBe(dietEntry.foodName);

    createdDietId = res.body.data._id;
  });

  it("Should get diet entries for the day view", async () => {
    const res = await agent
      .get("/api/diet/getDiet")
      .query({ viewType: "day", offset: 0 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Diet entries retrieved successfully");
    expect(res.body.data).toHaveProperty("diets");
    expect(Array.isArray(res.body.data.diets)).toBe(true);
    expect(res.body.data.count).toBeGreaterThan(0);
    expect(typeof res.body.data.prev).toBe("boolean");
    expect(typeof res.body.data.next).toBe("boolean");
  });

  it("Should get diet entries for a specific particularDate", async () => {
    const today = new Date().toISOString();
    const res = await agent
      .get("/api/diet/getDiet")
      .query({ viewType: "day", offset: 0, particularDate: today });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Diet entries retrieved successfully");
    expect(Array.isArray(res.body.data.diets)).toBe(true);
    expect(res.body.data.count).toBeGreaterThan(0);
  });

  it("Should get prev diets when offset is positive", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    await agent.post("/api/diet/createDiet").send({
      foodName: "Oatmeal Breakfast",
      meal: "breakfast",
      calories: 350,
      carbs: 50,
      protein: 10,
      fat: 5,
      mealDateAndTime: pastDate.toISOString(),
      mealWeight: 200,
      goalId: dietGoalId,
    });

    const res = await agent
      .get("/api/diet/getDiet")
      .query({ viewType: "week", offset: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data.prev).toBe(true);
  });

  it("Should get next diets when offset is negative", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    await agent.post("/api/diet/createDiet").send({
      foodName: "Future Salad",
      meal: "dinner",
      calories: 400,
      carbs: 20,
      protein: 30,
      fat: 10,
      mealDateAndTime: futureDate.toISOString(),
      mealWeight: 250,
      goalId: dietGoalId,
    });

    const res = await agent
      .get("/api/diet/getDiet")
      .query({ viewType: "week", offset: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data.next).toBe(true);
  });

  it("Should update an existing diet entry", async () => {
    const updatedFields = { calories: 500 };

    const res = await agent
      .put(`/api/diet/update/${createdDietId}`)
      .send(updatedFields);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Diet entry updated successfully");
    expect(res.body.data.calories).toBe(500);
  });

  it("Should delete a diet entry", async () => {
    const res = await agent.delete(`/api/diet/delete/${createdDietId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Diet entry deleted successfully");
  });

  it("Should return 404 when deleting non-existing diet", async () => {
    const res = await agent.delete(`/api/diet/delete/${createdDietId}`);
    expect(res.status).toBe(404);
  });
});
