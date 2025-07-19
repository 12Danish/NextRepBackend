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
const UserModel_1 = require("../models/UserModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const customError_1 = require("../utils/customError");
const jwtUtils_1 = require("../utils/jwtUtils");
const firebaseAdminCofig_1 = __importDefault(require("../config/firebaseAdminCofig"));
class UserAuthServices {
    static userRegisterService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ username, email, password, }) {
            // 1. Check if a user already exists with the same email and local auth
            const existingUser = yield UserModel_1.User.findOne({
                email: email,
                authProvider: "local",
            });
            if (existingUser) {
                // Throw an error or return a message
                throw new customError_1.CustomError("User already exists with this email", 409);
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 2);
            const newUser = yield UserModel_1.User.create({
                username,
                email,
                password: hashedPassword,
                authProvider: "local",
            });
            return newUser;
        });
    }
    static userCustomLoginService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, password, }) {
            var _b;
            // Find the user by email and local provider
            const user = yield UserModel_1.User.findOne({
                email,
                authProvider: "local",
            });
            if (!user) {
                throw new customError_1.CustomError("User with this email not found for local auth", 401);
            }
            // Compare passwords using bcrypt
            const isPasswordValid = yield bcryptjs_1.default.compare(password, (_b = user.password) !== null && _b !== void 0 ? _b : "");
            // If user authentiation fails return
            if (!isPasswordValid) {
                throw new customError_1.CustomError("Invalid email or password", 401);
            }
            const token = (0, jwtUtils_1.generateToken)({
                id: user._id,
                email: user.email,
                authProvider: user.authProvider,
            });
            console.log("returning: ", user);
            return {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    authProvider: user.authProvider,
                },
            };
        });
    }
    static userFirebaseLoginService(firebaseToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const decoded = yield firebaseAdminCofig_1.default.verifyIdToken(firebaseToken);
            console.log("[ Decoded Firebase Token]:", decoded);
            const firebaseUid = decoded.uid;
            const email = (_a = decoded.email) !== null && _a !== void 0 ? _a : `${firebaseUid}@noemail.com`;
            const rawAuthProvider = decoded.firebase.sign_in_provider;
            let authProvider;
            if (rawAuthProvider === "google.com") {
                authProvider = "google";
            }
            else if (rawAuthProvider === "github.com") {
                authProvider = "github";
            }
            else {
                throw new customError_1.CustomError("Unsupported auth provider", 400);
            }
            let user = yield UserModel_1.User.findOne({ firebaseUid });
            if (!user) {
                try {
                    user = yield UserModel_1.User.create({
                        email,
                        authProvider,
                        firebaseUid,
                        username: (_b = decoded.name) !== null && _b !== void 0 ? _b : "User",
                    });
                }
                catch (error) {
                    throw new customError_1.CustomError(`The following error occurred while trying to create user with firebase: ${error}`, 500);
                }
            }
            if (user && !user.username && decoded.name) {
                user.username = decoded.name;
                yield user.save();
            }
            const token = (0, jwtUtils_1.generateToken)({
                id: user._id,
                email: user.email,
                authProvider: user.authProvider,
            });
            return {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    authProvider: user.authProvider,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            };
        });
    }
}
exports.default = UserAuthServices;
