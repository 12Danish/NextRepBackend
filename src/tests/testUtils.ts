import request from "supertest";
import { app } from "../server";

export const registerAndLoginUser = async () => {
  const agent = request.agent(app);

  const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "Password123!",
  };

  // Register user
  await agent.post("/api/userRegister").send(testUser);

  // Login user
  await agent.post("/api/customLogin").send({
    email: testUser.email,
    password: testUser.password,
  });

  return agent;
};
