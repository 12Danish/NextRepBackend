import request from "supertest";
import { app } from "../server";


describe(" User Auth Tests Suite", () => {
  const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "Password123!",
  };

  describe("POST /api/userRegister", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/userRegister").send(testUser);

      expect(res.status).toBe(200);
    });

    it("should fail when email is missing", async () => {
      const res = await request(app).post("/api/userRegister").send({
        username: "noemailuser",
        password: "pass123",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/customLogin", () => {
    it("should login successfully and set a cookie", async () => {
      const res = await request(app)
        .post("/api/customLogin")
        .send({ email: testUser.email, password: testUser.password });


      expect(res.status).toBe(200);

      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should fail login with wrong password", async () => {
      const res = await request(app)
        .post("/api/customLogin")
        .send({ email: testUser.email, password: "WrongPass123" });
   

      expect(res.status).toBe(401); // unauthorized
    });
  });

  describe("GET /api/logout", () => {
    it("should clear token cookie on logout", async () => {
      const agent = request.agent(app);

      // First login to set cookie
      await agent.post("/api/customLogin").send({
        email: testUser.email,
        password: testUser.password,
      });

      // Then logout
      const res = await agent.get("/api/logout");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Successfully logged out");
      expect(res.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("token=;")])
      );
    });
  });
});
