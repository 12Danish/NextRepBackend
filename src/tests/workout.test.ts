import { registerAndLoginUser } from "./testUtils";

describe("Workout Tests Suite", () => {
  let agent: any;
  let workoutGoalId: string;

  beforeAll(async () => {
    agent = await registerAndLoginUser();

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
    workoutGoalId = res.body.newGoal._id;
  });

  it("Should get correct workout when using day viewType with offsets", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Create yesterday's workout
    await agent.post("/api/workout/create").send({
      exerciseName: "Bench Press",
      type: "weight lifting",
      reps: 10,
      duration: null,
      targetMuscleGroup: ["chest"],
      goalId: workoutGoalId,
      workoutDateAndTime: yesterday.toISOString(),
    });

    // Create today's workout
    await agent.post("/api/workout/create").send({
      exerciseName: "Pull Ups",
      type: "weight lifting",
      reps: 15,
      duration: null,
      targetMuscleGroup: ["back"],
      goalId: workoutGoalId,
      workoutDateAndTime: today.toISOString(),
    });

    // Fetch today's schedule
    const resToday = await agent
      .get("/api/workout/getSchedule")
      .query({ viewType: "day", offset: 0 });

    expect(resToday.status).toBe(200);
    expect(resToday.body.workouts.length).toBe(1);
    expect(resToday.body.workouts[0].exerciseName).toBe("Pull Ups");
    expect(typeof resToday.body.prev).toBe("boolean");
    expect(typeof resToday.body.next).toBe("boolean");

    // Fetch yesterday's schedule
    const resYesterday = await agent
      .get("/api/workout/getSchedule")
      .query({ viewType: "day", offset: -1 });

    expect(resYesterday.status).toBe(200);
    expect(resYesterday.body.workouts.length).toBe(1);
    expect(resYesterday.body.workouts[0].exerciseName).toBe("Bench Press");
    expect(typeof resYesterday.body.prev).toBe("boolean");
    expect(typeof resYesterday.body.next).toBe("boolean");

    // Tomorrow should be empty
    const resTomorrow = await agent
      .get("/api/workout/getSchedule")
      .query({ viewType: "day", offset: 1 });

    expect(resTomorrow.status).toBe(200);
    expect(resTomorrow.body.workouts.length).toBe(0);
    expect(typeof resTomorrow.body.prev).toBe("boolean");
    expect(typeof resTomorrow.body.next).toBe("boolean");
  });

  it("Should get workout schedule filtered correctly by particularDate for day, week, and month", async () => {
    // Fixed base date
    const baseDate = new Date("2025-01-15T10:00:00Z"); // Wednesday
    const dayBefore = new Date("2025-01-14T10:00:00Z"); // Tuesday
    const dayAfter = new Date("2025-01-16T10:00:00Z"); // Thursday
    const sameMonthDiffWeek = new Date("2025-01-22T10:00:00Z"); // Next week
    const diffMonth = new Date("2025-02-01T10:00:00Z"); // Different month

    // Create workouts in various days
    const workoutsToCreate = [
      { date: baseDate, name: "Deadlift" },
      { date: dayBefore, name: "Bench Press" },
      { date: dayAfter, name: "Squats" },
      { date: sameMonthDiffWeek, name: "Overhead Press" },
      { date: diffMonth, name: "Pull Ups" },
    ];

    for (const w of workoutsToCreate) {
      await agent.post("/api/workout/create").send({
        exerciseName: w.name,
        type: "weight lifting",
        reps: 8,
        duration: null,
        targetMuscleGroup: ["chest"],
        goalId: workoutGoalId,
        workoutDateAndTime: w.date.toISOString(),
      });
    }

    // DAY viewType → Only Deadlift
    const resDay = await agent.get("/api/workout/getSchedule").query({
      viewType: "day",
      offset: 0,
      particularDate: baseDate.toISOString(),
    });

    console.log("This is the new Get Workout func");
    console.log(resDay.body);

    expect(resDay.status).toBe(200);
    expect(resDay.body.workouts.length).toBe(1);
    expect(resDay.body.workouts[0].exerciseName).toBe("Deadlift");

    // WEEK viewType → Deadlift, Bench Press, Squats (Tue-Wed-Thu of same week)
    const resWeek = await agent.get("/api/workout/getSchedule").query({
      viewType: "week",
      offset: 0,
      particularDate: baseDate.toISOString(),
    });

    expect(resWeek.status).toBe(200);
    const weekNames = resWeek.body.workouts.map((w: any) => w.exerciseName);
    expect(weekNames).toEqual(
      expect.arrayContaining(["Deadlift", "Bench Press", "Squats"])
    );
    expect(weekNames).not.toContain("Overhead Press"); // next week excluded
    expect(weekNames).not.toContain("Pull Ups"); // next month excluded

    // MONTH viewType → All except different month
    const resMonth = await agent.get("/api/workout/getSchedule").query({
      viewType: "month",
      offset: 0,
      particularDate: baseDate.toISOString(),
    });
    console.log("Month Response")
    console.log(resMonth.body)
    expect(resMonth.status).toBe(200);
    const monthNames = resMonth.body.workouts.map((w: any) => w.exerciseName);
    expect(monthNames).toEqual(
      expect.arrayContaining([
        "Deadlift",
        "Bench Press",
        "Squats",
        "Overhead Press",
      ])
    );
    expect(monthNames).not.toContain("Pull Ups");

    // Check prev/next flags for month
    expect(resMonth.body.prev).toBe(false); // older workouts exist
    expect(resMonth.body.next).toBe(true); // future workouts exist
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

    await agent.post("/api/workout/create").send(workoutData);

    const res = await agent.get("/api/workout/getSchedule");
    expect(res.status).toBe(200);
    expect(res.body.workouts.length).toBe(res.body.count);
    expect(typeof res.body.prev).toBe("boolean");
    expect(typeof res.body.next).toBe("boolean");
  });

  it("Should update a workout", async () => {
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

    const updateRes = await agent
      .patch(`/api/workout/updateWorkout/${workoutId}`)
      .send({ reps: 25, workoutDateAndTime: new Date().toISOString() });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.updatedWorkout.reps).toBe(25);
  });

  it("Should delete a workout", async () => {
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

    const deleteRes = await agent.delete(
      `/api/workout/deleteWorkout/${workoutId}`
    );
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe("Workout deleted successfully.");
  });
});
