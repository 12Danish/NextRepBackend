
import { registerAndLoginUser } from "../testUtils";


describe("Add Goal Tests Suite", () => {
  let agent: any;
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  beforeAll(async () => {
    agent = await registerAndLoginUser();
  });

  describe("Add Goal Tests", () => {
    describe("Weight Goal Tests", () => {
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

      it("should add a new weight goal successfully", async () => {
        const res = await agent.post("/api/goal/add").send(weightGoalData);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Goal created successfully");
        expect(res.body.newGoal).toHaveProperty("_id");
        expect(res.body.newGoal.category).toBe("weight");
        expect(res.body.newGoal.data.goalType).toBe("loss");
      });

      it("should fail to add weight goal with invalid goalType", async () => {
        const invalidGoalData = {
          ...weightGoalData,
          data: { ...weightGoalData.data, goalType: "invalid" },
        };
        const res = await agent.post("/api/goal/add").send(invalidGoalData);
        console.log("Status:", res.status);
        console.log("Body:", res.body);
        console.log("Text:", res.text);
        expect(res.status).toBe(400);
      });

      it("should fail to add weight goal with missing required fields", async () => {
        const invalidGoalData = {
          ...weightGoalData,
          data: { ...weightGoalData.data, targetWeight: undefined },
        };
        const res = await agent.post("/api/goal/add").send(invalidGoalData);
        console.log("Status:", res.status);
        console.log("Body:", res.body);
        console.log("Text:", res.text);
        expect(res.status).toBe(400);
      });
    });

    describe("Diet Goal Tests", () => {
      const dietGoalData = {
        category: "diet",
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
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

      it("should add a new diet goal successfully", async () => {
        const res = await agent.post("/api/goal/add").send(dietGoalData);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Goal created successfully");
        expect(res.body.newGoal).toHaveProperty("_id");
        expect(res.body.newGoal.category).toBe("diet");
        expect(res.body.newGoal.data.targetCalories).toBe(2000);
      });

      // it("should fail to add diet goal with negative values", async () => {
      //   const invalidGoalData = {
      //     ...dietGoalData,
      //     data: { ...dietGoalData.data, targetCalories: -100 },
      //   };
      //   const res = await agent.post("/api/goal/add").send(invalidGoalData);
      //   expect(res.status).toBe(400);
      // });

      it("should fail to add diet goal with missing required fields", async () => {
        const invalidGoalData = {
          ...dietGoalData,
          data: { ...dietGoalData.data, targetProteins: undefined },
        };
        const res = await agent.post("/api/goal/add").send(invalidGoalData);
        expect(res.status).toBe(400);
      });
    });

      describe("Sleep Goal Tests", () => {
        const sleepGoalData = {
          category: "sleep",
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
          targetDate: tomorrow.toISOString(),
          description: "Get 8 hours of sleep",
          status: "pending",
          data: {
            targetHours: 8,
          },
        };

        it("should add a new sleep goal successfully", async () => {
          const res = await agent.post("/api/goal/add").send(sleepGoalData);
          expect(res.status).toBe(200);
          expect(res.body.message).toBe("Goal created successfully");
          expect(res.body.newGoal).toHaveProperty("_id");
          expect(res.body.newGoal.category).toBe("sleep");
          expect(res.body.newGoal.data.targetHours).toBe(8);
        });

        // it("should fail to add sleep goal with negative hours", async () => {
        //   const invalidGoalData = {
        //     ...sleepGoalData,
        //     data: { targetHours: -1 },
        //   };
        //   const res = await agent.post("/api/goal/add").send(invalidGoalData);
        //   expect(res.status).toBe(400);
        // });

        it("should fail to add sleep goal with missing target hours", async () => {
          const invalidGoalData = {
            ...sleepGoalData,
            data: {},
          };
          const res = await agent.post("/api/goal/add").send(invalidGoalData);
          expect(res.status).toBe(400);
        });
      });

      describe("Workout Goal Tests", () => {
        const workoutGoalData = {
          category: "workout",
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
          targetDate: tomorrow.toISOString(),
          description: "Run 30 minutes daily",
          status: "pending",
          data: {
            exerciseName: "Running",
            targetMinutes: 30,
          },
        };

        it("should add a new workout goal successfully", async () => {
          const res = await agent.post("/api/goal/add").send(workoutGoalData);
          expect(res.status).toBe(200);
          expect(res.body.message).toBe("Goal created successfully");
          expect(res.body.newGoal).toHaveProperty("_id");
          expect(res.body.newGoal.category).toBe("workout");
          expect(res.body.newGoal.data.exerciseName).toBe("Running");
        });

        it("should add workout goal with target reps", async () => {
          const repsGoalData = {
            ...workoutGoalData,
            data: {
              exerciseName: "Push-ups",
              targetReps: 50,
            },
          };
          const res = await agent.post("/api/goal/add").send(repsGoalData);
          expect(res.status).toBe(200);
          expect(res.body.newGoal.data.targetReps).toBe(50);
        });

        it("should fail to add workout goal with missing exercise name", async () => {
          const invalidGoalData = {
            ...workoutGoalData,
            data: { targetMinutes: 30 },
          };
          const res = await agent.post("/api/goal/add").send(invalidGoalData);
          expect(res.status).toBe(400);
        });

      //   it("should fail to add workout goal with negative values", async () => {
      //     const invalidGoalData = {
      //       ...workoutGoalData,
      //       data: { exerciseName: "Running", targetMinutes: -30 },
      //     };
      //     const res = await agent.post("/api/goal/add").send(invalidGoalData);
      //     expect(res.status).toBe(400);
      //   });
      });

      describe("Common Goal Validation Tests", () => {
        const baseGoalData = {
          category: "weight",
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
          targetDate: tomorrow.toISOString(),
          description: "Test goal",
          status: "pending",
          data: {
            goalType: "loss",
            targetWeight: 70,
            currentWeight: 75,
            previousWeights: [{ weight: 75, date: today }],
          },
        };

        it("should fail to add goal with invalid category", async () => {
          const invalidGoalData = { ...baseGoalData, category: "invalid" };
          const res = await agent.post("/api/goal/add").send(invalidGoalData);
          expect(res.status).toBe(400);
        });

        it("should fail to add goal with invalid status", async () => {
          const invalidGoalData = { ...baseGoalData, status: "invalid" };
          const res = await agent.post("/api/goal/add").send(invalidGoalData);
          expect(res.status).toBe(400);
        });

        // it("should fail to add goal with endDate before startDate", async () => {
        //   const invalidGoalData = {
        //     ...baseGoalData,
        //     endDate: yesterday.toISOString(),
        //   };
        //   const res = await agent.post("/api/goal/add").send(invalidGoalData);
        //   expect(res.status).toBe(400);
        // });

        // it("should fail to add goal without authentication", async () => {
        //   const unauthenticatedAgent = request(app);
        //   const res = await unauthenticatedAgent
        //     .post("/api/goal/add")
        //     .send(baseGoalData);
        //   expect(res.status).toBe(401);
        // });
      });
  });
});
