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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const user_service_1 = require("../services/user.service");
exports.authController = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, email, password } = req.body;
            const result = yield auth_service_1.authService.register(name, email, password);
            res.status(201).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const result = yield auth_service_1.authService.login(email, password);
            res.json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    me: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const user = yield user_service_1.userService.findById(userId);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json({ user });
        }
        catch (err) {
            res.status(500).json({ error: "Internal server error" });
        }
    }),
    refreshToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { refreshToken } = req.body;
            const result = yield auth_service_1.authService.refreshToken(refreshToken);
            res.json(result);
        }
        catch (err) {
            res.status(401).json({ error: err.message });
        }
    }),
    forgotPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            const result = yield auth_service_1.authService.requestPasswordReset(email);
            res.json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token, newPassword } = req.body;
            const result = yield auth_service_1.authService.resetPassword(token, newPassword);
            res.json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    socialLoginCallback: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: "Authentication failed." });
                return;
            }
            const tokens = yield auth_service_1.authService.generateTokensForUser(user.id);
            // Redirect to frontend with tokens
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5656/";
            res.redirect(`${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
        }
        catch (err) {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5656/";
            res.redirect(`${frontendUrl}/login?error=${err.message}`);
        }
    }),
};
