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
// jest.setup.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, dbConfig_1.default)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Drop entire test DB and close connection after all tests
    yield mongoose_1.default.connection.dropDatabase();
    yield mongoose_1.default.connection.close();
}));
