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
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
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
});
