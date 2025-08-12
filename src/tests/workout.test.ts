import { registerAndLoginUser } from "./testUtils";

describe("Workout Tests Suite", () => {
  let agent: any;
  let workoutGoalId: string;

  beforeAll(async () => {
    // 1. Register & login user
    agent = await registerAndLoginUser();

    // 2. Create a workout goal
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

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

    const res = await agent.post("/api/goal/add").send(workoutGoal);
    console.log(res.body);
    workoutGoalId = res.body.newGoal._id;
  });

  it("Should get correct workout when using day viewType with offsets", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Create workout for yesterday
    const yesterdayRes = await agent.post("/api/workout/create").send({
      exerciseName: "Bench Press",
      type: "weight lifting",
      reps: 10,
      duration: null,
      targetMuscleGroup: ["chest"],
      goalId: workoutGoalId,
      workoutDateAndTime: yesterday.toISOString(),
    });

    // Create workout for today
    const todayRes = await agent.post("/api/workout/create").send({
      exerciseName: "Pull Ups",
      type: "weight lifting",
      reps: 15,
      duration: null,
      targetMuscleGroup: ["back"],
      goalId: workoutGoalId,
      workoutDateAndTime: today.toISOString(),
    });

    // ✅ Fetch workouts for today
    const resToday = await agent
      .get("/api/workout/getSchedule")
      .query({ viewType: "day", offset: 0 });

    expect(resToday.status).toBe(200);
    expect(resToday.body.workouts.length).toBe(1);
    expect(resToday.body.workouts[0].exerciseName).toBe("Pull Ups");

    // ✅ Fetch workouts for yesterday (offset -1)
    const resYesterday = await agent
      .get("/api/workout/getSchedule")
      .query({ viewType: "day", offset: -1 });

    expect(resYesterday.status).toBe(200);
    expect(resYesterday.body.workouts.length).toBe(1);
    expect(resYesterday.body.workouts[0].exerciseName).toBe("Bench Press");

    // ✅ Fetch workouts for tomorrow (offset +1) → Should be empty
    const resTomorrow = await agent
      .get("/api/workout/getSchedule")
      .query({ viewType: "day", offset: 1 });

    expect(resTomorrow.status).toBe(200);
    expect(resTomorrow.body.workouts.length).toBe(0);
  });

  it("Should add a workout linked to a goal", async () => {
    const workoutData = {
      exerciseName: "Running",
      type: "cardio",
      duration: 30,
      reps: null,
      targetMuscleGroup: ["legs", "core"],
      goalId: workoutGoalId,
      workoutDateAndTime: new Date().toISOString(),
    };

    const res = await agent.post("/api/workout/create").send(workoutData);
    console.log("Sdd goal res");
    console.log(res);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Workout successfully added");
    expect(res.body.newWorkout.goalId).toBe(workoutGoalId);
  });

  it("Should fail if neither duration nor reps is provided", async () => {
    const workoutData = {
      exerciseName: "Push Ups",
      type: "weight lifting",
      targetMuscleGroup: ["chest", "arms"],
      goalId: workoutGoalId,
      workoutDateAndTime: new Date().toISOString(),
    };

    const res = await agent.post("/api/workout/create").send(workoutData);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toEqual([
      { message: "Either duration or reps is needed" },
    ]);
  });

  it("Should get workout schedule", async () => {
    const workoutData = {
      exerciseName: "Running",
      type: "cardio",
      duration: 30,
      reps: null,
      targetMuscleGroup: ["legs", "core"],
      goalId: workoutGoalId,
      workoutDateAndTime: new Date().toISOString(),
    };

    const addRes = await agent.post("/api/workout/create").send(workoutData);
    console.log("add res body");
    console.log(addRes.body);

    const res = await agent.get("/api/workout/getSchedule");
    expect(res.status).toBe(200);
    console.log("workout res body");
    console.log(res.body);
    expect(res.body.workouts.length).toBe(res.body.count);
  });

  it("Should update a workout", async () => {
    // First create a workout to update
    const createRes = await agent.post("/api/workout/create").send({
      exerciseName: "Squats",
      type: "weight lifting",
      reps: 20,
      duration: null,
      targetMuscleGroup: ["legs"],
      goalId: workoutGoalId,
      workoutDateAndTime: new Date().toISOString(),
    });

    const workoutId = createRes.body.newWorkout._id;

    // Update it
    const updateRes = await agent
      .patch(`/api/workout/updateWorkout/${workoutId}`)
      .send({
        reps: 25,
        workoutDateAndTime: new Date().toISOString(),
      });
    console.log("Update res");
    console.log(updateRes.body);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.updatedWorkout.reps).toBe(25);
  });

  it("Should delete a workout", async () => {
    // First create a workout to delete
    const createRes = await agent.post("/api/workout/create").send({
      exerciseName: "Burpees",
      type: "cardio",
      reps: 10,
      duration: null,
      targetMuscleGroup: ["legs"],
      goalId: workoutGoalId,
      workoutDateAndTime: new Date().toISOString(),
    });
    const workoutId = createRes.body.newWorkout._id;

    // Delete it
    const deleteRes = await agent.delete(
      `/api/workout/deleteWorkout/${workoutId}`
    );
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe("Workout deleted successfully.");
  });
});
