"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const authInputHandler_1 = require("../middleware/authInputHandler");
const router = express_1.default.Router();
router
    .route("/userRegister")
    .post(authInputHandler_1.ValidationMiddleWare.validateCustomRegisterInput(), userControllers_1.registerUserController);
router.route("/logout").get(userControllers_1.logoutController);
router
    .route("/customLogin")
    .post(authInputHandler_1.ValidationMiddleWare.validCustomLoginInput(), userControllers_1.customLoginController);
router.route("/firebaseLogin").post(userControllers_1.firebaseLoginController);
exports.default = router;
