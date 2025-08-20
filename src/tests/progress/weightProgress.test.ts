import { registerAndLoginUser } from "../testUtils";

describe("Weight Progress API Routes Testing Suite", () => {
  let agent: any;
  let userId: any;
  let weightGoalId: any;
  let secondWeightGoalId: any;
  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  beforeAll(async () => {
    agent = await registerAndLoginUser();
    userId = agent.userId;

    // Create first weight goal (loss)
    const weightGoalData = {
      category: "weight",
      startDate: today.toISOString(),
      targetDate: nextMonth.toISOString(),
      description: "Lose 5kg",
      status: "pending",
      data: {
        goalType: "loss",
        targetWeight: 70,
        currentWeight: 75,
        previousWeights: [],
      },
    };

    const response = await agent.post("/api/goal/add").send(weightGoalData);
    console.log("This is the setup");
    console.log(response.status);
    weightGoalId = response.body.newGoal._id;

    // Create second weight goal (gain) for testing multiple goals
    const secondWeightGoalData = {
      category: "weight",
      startDate: today.toISOString(),
      targetDate: nextMonth.toISOString(),
      description: "Gain muscle",
      status: "pending",
      data: {
        goalType: "gain",
        targetWeight: 80,
        currentWeight: 75,
        previousWeights: [
          {
            weight: 73,
            date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            weight: 74,
            date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    };

    const secondResponse = await agent
      .post("/api/goal/add")
      .send(secondWeightGoalData);
    secondWeightGoalId = secondResponse.body.newGoal._id;

    // Update weights to create more data points
    const res = await agent
      .put(`/api/goal/updateWeight/${weightGoalId}`)
      .send({ newWeight: 74 });

    console.log("Initial res");
    console.log(JSON.stringify(res.body, null, 2));

    const res2 = await agent
      .put(`/api/goal/updateWeight/${weightGoalId}`)
      .send({ newWeight: 73 });

    console.log("Initial res2");
    console.log(JSON.stringify(res2.body, null, 2));
  });

  describe("GET /api/progress/WeightGoalProgress/:goalId", () => {
    describe("Valid requests", () => {
      it("should return progress for weight loss goal", async () => {
        const response = await agent.get(
          `/api/progress/WeightGoalProgress/${weightGoalId}`
        );

        console.log("This is the faulty route");
        console.log(response.status);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("goalId");
        expect(response.body).toHaveProperty("progress");
        expect(response.body).toHaveProperty("message");
        expect(response.body.goalId).toBe(weightGoalId);
        expect(typeof response.body.progress).toBe("number");
        expect(response.body.message).toBe(
          "Weight goal progress calculated successfully"
        );
      });

      it("should return progress for weight gain goal", async () => {
        const response = await agent.get(
          `/api/progress/WeightGoalProgress/${secondWeightGoalId}`
        );

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("progress");
        expect(typeof response.body.progress).toBe("number");
        expect(response.body.progress).toBeGreaterThanOrEqual(0);
        expect(response.body.progress).toBeLessThanOrEqual(100);
      });

      it("should calculate correct progress percentage", async () => {
        const response = await agent.get(
          `/api/progress/WeightGoalProgress/${weightGoalId}`
        );

        expect(response.status).toBe(200);
        // Starting weight: 75, current: 73, target: 70
        // Progress should be (75-73)/(75-70) = 2/5 = 40%
        expect(response.body.progress).toBeCloseTo(40, 1);
      });

      it("should round progress to 2 decimal places", async () => {
        const response = await agent.get(
          `/api/progress/WeightGoalProgress/${weightGoalId}`
        );

        expect(response.status).toBe(200);
        const progressStr = response.body.progress.toString();
        const decimalPart = progressStr.split(".")[1];
        if (decimalPart) {
          expect(decimalPart.length).toBeLessThanOrEqual(2);
        }
      });

      it("should return 100% when goal is achieved or exceeded", async () => {
        // Create a goal where target is achieved
        const achievedGoalData = {
          category: "weight",
          startDate: today.toISOString(),
          targetDate: nextMonth.toISOString(),
          description: "Already achieved",
          status: "pending",
          data: {
            goalType: "loss",
            targetWeight: 70,
            currentWeight: 69, // Below target
            previousWeights: [{ weight: 75, date: today }],
          },
        };

        const response = await agent
          .post("/api/goal/add")
          .send(achievedGoalData);
        const achievedGoalId = response.body.newGoal._id;

        const progressResponse = await agent.get(
          `/api/progress/WeightGoalProgress/${achievedGoalId}`
        );

        expect(progressResponse.status).toBe(200);
        expect(progressResponse.body.progress).toBe(100);

        // Cleanup
        await agent.delete(`/api/goal/${achievedGoalId}`).send();
      });

      it("should handle maintenance goal progress", async () => {
        // Create a maintenance goal
        const maintenanceGoalData = {
          category: "weight",
          startDate: today.toISOString(),
          targetDate: nextMonth.toISOString(),
          description: "Maintain weight",
          status: "pending",
          data: {
            goalType: "maintenance",
            targetWeight: 75,
            currentWeight: 75.5, // 0.5 lbs from target
            previousWeights:  [],
          },
        };

        const response = await agent
          .post("/api/goal/add")
          .send(maintenanceGoalData);
        const maintenanceGoalId = response.body.newGoal._id;

        const progressResponse = await agent.get(
          `/api/progress/WeightGoalProgress/${maintenanceGoalId}`
        );

        expect(progressResponse.status).toBe(200);
        expect(progressResponse.body.progress).toBeGreaterThan(50);
        expect(progressResponse.body.progress).toBeLessThan(100);

        // Cleanup
        await agent.delete(`/api/goal/${maintenanceGoalId}`).send();
      });
    });

    describe("Error handling", () => {
      it("should return 500 for invalid goalId format", async () => {
        const response = await agent.get(
          "/api/progress/WeightGoalProgress/invalid-id"
        );

        expect(response.status).toBe(500);
      });

      it("should return 500 for non-existent goal", async () => {
        const fakeGoalId = "507f1f77bcf86cd799439011";
        const response = await agent.get(
          `/api/progress/WeightGoalProgress/${fakeGoalId}`
        );

        expect(response.status).toBe(500);
      });
    });
  });

  describe("GET /api/progress/WeightGraphProgress", () => {
    describe("Valid requests", () => {
      it("should return weight graph data for authenticated user", async () => {
        const response = await agent.get("/api/progress/WeightGraphProgress");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("totalGoals");
        expect(response.body).toHaveProperty("dateRange");
        expect(response.body.message).toBe(
          "Weight graph data retrieved successfully"
        );
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.totalGoals).toBeGreaterThan(0);
      });

      it("should return data with correct structure", async () => {
        const response = await agent.get("/api/progress/WeightGraphProgress");

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThan(0);

        const firstEntry = response.body.data[0];
        expect(firstEntry).toHaveProperty("weight");
        expect(firstEntry).toHaveProperty("date");
        expect(firstEntry).toHaveProperty("goalId");
        expect(firstEntry).toHaveProperty("goalType");
        expect(firstEntry).toHaveProperty("targetWeight");
        expect(firstEntry).toHaveProperty("isCurrent");

        expect(typeof firstEntry.weight).toBe("number");
        expect(typeof firstEntry.date).toBe("string");
        expect(typeof firstEntry.isCurrent).toBe("boolean");
      });

      it("should return data sorted by date ascending", async () => {
        const response = await agent.get("/api/progress/WeightGraphProgress");

        expect(response.status).toBe(200);

        const data = response.body.data;
        for (let i = 1; i < data.length; i++) {
          expect(new Date(data[i].date) >= new Date(data[i - 1].date)).toBe(
            true
          );
        }
      });

      it("should format dates as YYYY-MM-DD", async () => {
        const response = await agent.get("/api/progress/WeightGraphProgress");

        expect(response.status).toBe(200);

        response.body.data.forEach((entry: any) => {
          expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
      });

      it("should include dateRange information", async () => {
        const response = await agent.get("/api/progress/WeightGraphProgress");

        expect(response.status).toBe(200);

        const dateRange = response.body.dateRange;
        expect(dateRange).toHaveProperty("start");
        expect(dateRange).toHaveProperty("end");
        expect(dateRange.start).not.toBeNull();
        expect(dateRange.end).not.toBeNull();
        expect(new Date(dateRange.start)).toBeInstanceOf(Date);
        expect(new Date(dateRange.end)).toBeInstanceOf(Date);
      });

      it("should mark current weight entries correctly", async () => {
        const response = await agent.get("/api/progress/WeightGraphProgress");

        expect(response.status).toBe(200);

        const currentEntries = response.body.data.filter(
          (entry: any) => entry.isCurrent
        );
        expect(currentEntries.length).toBeGreaterThan(0);
      });

      it("should remove duplicate dates and keep latest entry", async () => {
        const response = await agent.get("/api/progress/WeightGraphProgress");

        expect(response.status).toBe(200);

        const dates = response.body.data.map((entry: any) => entry.date);
        const uniqueDates = [...new Set(dates)];
        expect(dates.length).toBe(uniqueDates.length);
      });

      it("should include both previous weights and current weights", async () => {
        const response = await agent.get("/api/progress/WeightGraphProgress");

        expect(response.status).toBe(200);

        const hasCurrentEntries = response.body.data.some(
          (entry: any) => entry.isCurrent === true
        );
        const hasHistoricalEntries = response.body.data.some(
          (entry: any) => entry.isCurrent === false
        );

        expect(hasCurrentEntries).toBe(true);
        expect(hasHistoricalEntries).toBe(true);
      });
    });
  });

  describe("Integration with weight updates", () => {
    it("should reflect updated progress after weight change", async () => {
      // Get initial progress
      const initialResponse = await agent.get(
        `/api/progress/WeightGoalProgress/${weightGoalId}`
      );
      const initialProgress = initialResponse.body.progress;

      // Update weight (closer to target for loss goal)
      await agent
        .put(`/api/goal/updateWeight/${weightGoalId}`)
        .send({ newWeight: 72 });

      // Get updated progress
      const updatedResponse = await agent.get(
        `/api/progress/WeightGoalProgress/${weightGoalId}`
      );
      const updatedProgress = updatedResponse.body.progress;

      expect(updatedProgress).toBeGreaterThan(initialProgress);
    });

    it("should include new weight entry in graph data after update", async () => {
      // Get initial graph data count
      const initialResponse = await agent.get(
        "/api/progress/WeightGraphProgress"
      );
      const initialCount = initialResponse.body.data.length;

      // Update weight with different value to ensure new entry
      await agent
        .put(`/api/goal/updateWeight/${weightGoalId}`)
        .send({ newWeight: 71.5 });

      // Get updated graph data
      const updatedResponse = await agent.get(
        "/api/progress/WeightGraphProgress"
      );

      expect(updatedResponse.body.data.length).toBeGreaterThanOrEqual(
        initialCount
      );

      // Should have the new weight value
      const hasNewWeight = updatedResponse.body.data.some(
        (entry: any) => entry.weight === 71.5
      );
      expect(hasNewWeight).toBe(true);
    });
  });
});
