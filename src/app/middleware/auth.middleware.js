"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const authMiddleware = (accessType) => {
    return (req, res, next) => {
        if (accessType === 'public') {
            // Rota pública, segue normalmente
            return next();
        }
        // Rota privada: exige token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: "Token não fornecido" });
            return;
        }
        const token = authHeader.split(" ")[1]; // Bearer TOKEN
        if (!token) {
            res.status(401).json({ error: "Token inválido" });
            return;
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.userId = payload.userId;
            next();
        }
        catch (_a) {
            res.status(401).json({ error: "Token expirado ou inválido" });
            return;
        }
    };
};
exports.authMiddleware = authMiddleware;
// Middlewares específicos para facilitar o uso
exports.requireAuth = (0, exports.authMiddleware)('private');
exports.optionalAuth = (0, exports.authMiddleware)('public');
