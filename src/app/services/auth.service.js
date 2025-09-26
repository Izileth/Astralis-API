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
exports.authService = void 0;
const client_1 = require("../prisma/client");
const slugfy_1 = require("../utils/slugfy");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
// Environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-secret";
const ACCESS_TOKEN_EXPIRATION = "15m";
const REFRESH_TOKEN_EXPIRATION = "7d";
exports.authService = {
    // Gerar tokens para um usuário
    generateTokensForUser: function (userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = jsonwebtoken_1.default.sign({ userId }, ACCESS_TOKEN_SECRET, {
                expiresIn: ACCESS_TOKEN_EXPIRATION,
            });
            const refreshToken = jsonwebtoken_1.default.sign({ userId }, REFRESH_TOKEN_SECRET, {
                expiresIn: REFRESH_TOKEN_EXPIRATION,
            });
            const hashedToken = crypto_1.default
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");
            // Armazenar o refresh token no banco de dados
            yield client_1.prisma.refreshToken.create({
                data: {
                    userId,
                    hashedToken,
                },
            });
            return { accessToken, refreshToken };
        });
    },
    // Registrar usuário
    register: function (name, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield client_1.prisma.user.findUnique({ where: { email } });
            if (existingUser)
                throw new Error("Email já cadastrado");
            const slugBase = (0, slugfy_1.slugify)(name);
            let slug = slugBase;
            let count = 1;
            while (yield client_1.prisma.user.findUnique({ where: { slug } })) {
                slug = `${slugBase}-${count++}`;
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield client_1.prisma.user.create({
                data: { name, email, password: hashedPassword, slug },
            });
            const tokens = yield this.generateTokensForUser(user.id);
            return Object.assign({ user }, tokens);
        });
    },
    // Login
    login: function (email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield client_1.prisma.user.findUnique({
                where: { email },
                include: {
                    posts: true,
                    comments: true,
                    likes: true,
                    followers: true,
                    following: true,
                    socialLinks: true,
                },
            });
            if (!user || !user.password) {
                throw new Error("Usuário não encontrado ou login social utilizado");
            }
            const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!passwordMatch)
                throw new Error("Senha incorreta");
            const tokens = yield this.generateTokensForUser(user.id);
            return Object.assign({ user }, tokens);
        });
    },
    // Refresh Token
    refreshToken: (token) => __awaiter(void 0, void 0, void 0, function* () {
        if (!token) {
            throw new Error("Refresh token não fornecido");
        }
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const refreshToken = yield client_1.prisma.refreshToken.findUnique({
            where: { hashedToken },
        });
        if (!refreshToken || refreshToken.revoked) {
            throw new Error("Refresh token inválido ou revogado");
        }
        // Verify the refresh token itself
        try {
            const payload = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
            // Issue a new access token
            const accessToken = jsonwebtoken_1.default.sign({ userId: payload.userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
            return { accessToken };
        }
        catch (err) {
            throw new Error("Refresh token expirado ou inválido");
        }
    }),
    // Solicitar redefinição de senha
    requestPasswordReset: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield client_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Não revele que o usuário não existe
            return {
                message: "Se um usuário com este email existir, um link para redefinição de senha será enviado.",
            };
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const passwordResetToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hora
        yield client_1.prisma.user.update({
            where: { email },
            data: {
                passwordResetToken,
                passwordResetExpires,
            },
        });
        // Em um app real, você enviaria o `resetToken` por email
        // Para este exemplo, vamos apenas retornar uma mensagem de sucesso
        // e o token para facilitar o teste.
        return {
            message: "Solicitação de redefinição de senha enviada com sucesso.",
            resetToken, // Apenas para fins de desenvolvimento/teste
        };
    }),
    // Redefinir a senha
    resetPassword: (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
        if (!token || !newPassword) {
            throw new Error("Token e nova senha são obrigatórios");
        }
        const passwordResetToken = crypto_1.default
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const user = yield client_1.prisma.user.findFirst({
            where: {
                passwordResetToken,
                passwordResetExpires: {
                    gte: new Date(),
                },
            },
        });
        if (!user) {
            throw new Error("Token de redefinição de senha inválido ou expirado");
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield client_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
        // Opcional: revogar todos os refresh tokens existentes para segurança
        yield client_1.prisma.refreshToken.updateMany({
            where: { userId: user.id },
            data: { revoked: true },
        });
        return { message: "Senha redefinida com sucesso." };
    }),
    // Manter a verificação de token para o middleware, mas usando o secret do access token
    verifyToken: (token) => {
        try {
            return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        }
        catch (_a) {
            throw new Error("Token inválido ou expirado");
        }
    },
};
