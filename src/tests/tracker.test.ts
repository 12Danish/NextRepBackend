import { registerAndLoginUser } from "./testUtils";

describe("Tracker Tests Suite", () => {
  let agent;

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  let workoutId;
  let dietId;
  let sleepId;
  let weightId;

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

    // Sending Post Request to register the workout

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
  });
});
