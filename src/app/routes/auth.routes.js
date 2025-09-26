"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const passport_1 = __importDefault(require("../config/passport"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.authController.register);
router.post("/login", auth_controller_1.authController.login);
router.get("/me", auth_middleware_1.requireAuth, auth_controller_1.authController.me);
// Rotas de atualização de token e redefinição de senha
router.post("/refresh-token", auth_controller_1.authController.refreshToken);
router.post("/forgot-password", auth_controller_1.authController.forgotPassword);
router.post("/reset-password", auth_controller_1.authController.resetPassword);
// Rotas de autenticação social
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), auth_controller_1.authController.socialLoginCallback);
router.get("/discord", passport_1.default.authenticate("discord"));
router.get("/discord/callback", passport_1.default.authenticate("discord", { failureRedirect: "/login" }), auth_controller_1.authController.socialLoginCallback);
exports.default = router;
