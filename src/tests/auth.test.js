"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
describe(" User Auth Tests Suite", () => {
    const testUser = {
        username: "testuser",
        email: "testuser@example.com",
        password: "Password123!",
    };
    describe("POST /api/userRegister", () => {
        it("should register a new user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.app).post("/api/userRegister").send(testUser);
            expect(res.status).toBe(200);
        }));
        it("should fail when email is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.app).post("/api/userRegister").send({
                username: "noemailuser",
                password: "pass123",
            });
            expect(res.status).toBe(400);
        }));
    });
    describe("POST /api/customLogin", () => {
        it("should login successfully and set a cookie", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.app)
                .post("/api/customLogin")
                .send({ email: testUser.email, password: testUser.password });
            expect(res.status).toBe(200);
            expect(res.headers["set-cookie"]).toBeDefined();
        }));
        it("should fail login with wrong password", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.app)
                .post("/api/customLogin")
                .send({ email: testUser.email, password: "WrongPass123" });
            expect(res.status).toBe(401); // unauthorized
        }));
    });
    describe("GET /api/logout", () => {
        it("should clear token cookie on logout", () => __awaiter(void 0, void 0, void 0, function* () {
            const agent = supertest_1.default.agent(server_1.app);
            // First login to set cookie
            yield agent.post("/api/customLogin").send({
                email: testUser.email,
                password: testUser.password,
            });
            // Then logout
            const res = yield agent.get("/api/logout");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Successfully logged out");
            expect(res.headers["set-cookie"]).toEqual(expect.arrayContaining([expect.stringContaining("token=;")]));
        }));
    });
});
