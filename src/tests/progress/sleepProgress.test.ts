import { registerAndLoginUser } from "../testUtils";

describe("Sleep Progress Tests Suite", () => {
  let agent: any;
  let userId;
  let sleepId: any;
  let additionalSleepIds: any = [];

  beforeAll(async () => {
    agent = await registerAndLoginUser();
    userId = agent.userId; // assuming registerAndLoginUser sets this

    // Create a sleep goal for today
    const today = new Date();
    const res = await agent.post("/api/sleep/create").send({
      duration: 480, // 8 hours in minutes
      date: today.toISOString(),
    });

    sleepId = res.body.data._id;

    // Create additional sleep records for testing different scenarios
    const testDates = [
      new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    ];

    const testDurations = [420, 540, 360, 600, 300]; // Various sleep durations

    for (let i = 0; i < testDates.length; i++) {
      const sleepRes = await agent.post("/api/sleep/create").send({
        duration: testDurations[i],
        date: testDates[i].toISOString(),
      });
      additionalSleepIds.push(sleepRes.body.data._id);
    }
  });

  afterAll(async () => {
    // Cleanup created sleep records
    if (sleepId) {
      await agent.delete(`/api/sleep/${sleepId}`).send();
    }

    for (const id of additionalSleepIds) {
      await agent.delete(`/api/sleep/${id}`).send();
    }
  });

  describe("GET /api/progress/sleepStats", () => {
    describe("Default behavior (week view)", () => {
      it("should return sleep stats for the current week by default", async () => {
        const response = await agent.get("/api/progress/sleepStats");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result");
        expect(response.body.result).toHaveProperty("message");
        expect(response.body.result).toHaveProperty("data");
        expect(response.body.result).toHaveProperty("dateRange");
        expect(response.body.result.dateRange.viewType).toBe("week");
        expect(Array.isArray(response.body.result.data)).toBe(true);
      });

      it("should return 7 days of data for week view", async () => {
        const response = await agent.get("/api/progress/sleepStats");

        expect(response.status).toBe(200);
        expect(response.body.result.data.length).toBe(7);
      });

      it("should fill missing dates with zero values", async () => {
        const response = await agent.get("/api/progress/sleepStats");

        expect(response.status).toBe(200);

        const data = response.body.result.data;
        const missingDateEntry = data.find(
          (entry: any) => entry.duration === 0
        );

        if (missingDateEntry) {
          expect(missingDateEntry).toMatchObject({
            duration: 0,
            averageDuration: 0,
            sleepCount: 0,
            goalId: null,
          });
        }
      });
    });

    describe("Week view", () => {
      it("should return sleep stats for week view", async () => {
        const response = await agent.get(
          "/api/progress/sleepStats?viewType=week"
        );

        expect(response.status).toBe(200);
        expect(response.body.result.dateRange.viewType).toBe("week");
        expect(response.body.result.data.length).toBe(7);
      });

      it("should include today's sleep data in week view", async () => {
        const response = await agent.get(
          "/api/progress/sleepStats?viewType=week"
        );

        expect(response.status).toBe(200);

        const today = new Date().toISOString().split("T")[0];
        const todayData = response.body.result.data.find(
          (entry: any) => entry.date === today
        );

        expect(todayData).toBeDefined();
        expect(todayData.duration).toBeGreaterThan(0);
      });
    });

    describe("Month view", () => {
      it("should return sleep stats for month view", async () => {
        const response = await agent.get(
          "/api/progress/sleepStats?viewType=month"
        );

        expect(response.status).toBe(200);
        expect(response.body.result.dateRange.viewType).toBe("month");
        expect(response.body.result.data.length).toBe(30);
      });

      it("should include historical data in month view", async () => {
        const response = await agent.get(
          "/api/progress/sleepStats?viewType=month"
        );

        expect(response.status).toBe(200);

        const dataWithSleep = response.body.result.data.filter(
          (entry: any) => entry.duration > 0
        );
        expect(dataWithSleep.length).toBeGreaterThan(0);
      });
    });

    describe("Day view", () => {
      it("should return sleep stats for day view", async () => {
        const response = await agent.get(
          "/api/progress/sleepStats?viewType=day"
        );

        expect(response.status).toBe(200);
        expect(response.body.result.dateRange.viewType).toBe("day");
        expect(response.body.result.data.length).toBe(1);
      });

      it("should return today's data for day view", async () => {
        const response = await agent.get(
          "/api/progress/sleepStats?viewType=day"
        );

        expect(response.status).toBe(200);

        const today = new Date().toISOString().split("T")[0];
        const todayData = response.body.result.data[0];

        expect(todayData.date).toBe(today);
        expect(todayData.duration).toBeGreaterThan(0);
      });
    });

    describe("Data structure validation", () => {
      it("should return data with correct structure", async () => {
        const response = await agent.get("/api/progress/sleepStats");

        expect(response.status).toBe(200);

        const firstEntry = response.body.result.data[0];
        expect(firstEntry).toHaveProperty("date");
        expect(firstEntry).toHaveProperty("duration");
        expect(firstEntry).toHaveProperty("averageDuration");
        expect(firstEntry).toHaveProperty("sleepCount");
        expect(firstEntry).toHaveProperty("goalId");
      });

      it("should return date range information", async () => {
        const response = await agent.get("/api/progress/sleepStats");

        expect(response.status).toBe(200);

        const dateRange = response.body.result.dateRange;
        expect(dateRange).toHaveProperty("start");
        expect(dateRange).toHaveProperty("end");
        expect(dateRange).toHaveProperty("viewType");
        expect(new Date(dateRange.start)).toBeInstanceOf(Date);
        expect(new Date(dateRange.end)).toBeInstanceOf(Date);
      });

      it("should return data sorted by date ascending", async () => {
        const response = await agent.get("/api/progress/sleepStats");

        expect(response.status).toBe(200);

        const data = response.body.result.data;
        for (let i = 1; i < data.length; i++) {
          expect(new Date(data[i].date)).toBeInstanceOf(Date);
          expect(new Date(data[i].date) >= new Date(data[i - 1].date)).toBe(
            true
          );
        }
      });
    });

    describe("Edge cases", () => {
      it("should handle invalid viewType gracefully", async () => {
        const response = await agent.get(
          "/api/progress/sleepStats?viewType=invalid"
        );

        // Should either default to week or return an error
        expect([200, 400]).toContain(response.status);
      });

      it("should handle case-sensitive viewType", async () => {
        const response = await agent.get(
          "/api/progress/sleepStats?viewType=WEEK"
        );

        // Should either work or return appropriate error
        expect([200, 400]).toContain(response.status);
      });
    });

    describe("Performance and data validation", () => {
      it("should respond within reasonable time", async () => {
        const startTime = Date.now();

        const response = await agent.get("/api/progress/sleepStats");

        const responseTime = Date.now() - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
      });

      it("should return numeric values for duration fields", async () => {
        const response = await agent.get("/api/progress/sleepStats");

        expect(response.status).toBe(200);

        response.body.result.data.forEach((entry: any) => {
          expect(typeof entry.duration).toBe("number");
          expect(typeof entry.averageDuration).toBe("number");
          expect(typeof entry.sleepCount).toBe("number");
          expect(entry.duration).toBeGreaterThanOrEqual(0);
          expect(entry.averageDuration).toBeGreaterThanOrEqual(0);
          expect(entry.sleepCount).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
