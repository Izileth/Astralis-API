import { prisma } from "../prisma/client";
import { slugify } from "../utils/slugfy";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-secret";
const ACCESS_TOKEN_EXPIRATION = "15m";
const REFRESH_TOKEN_EXPIRATION = "7d";

export const authService = {
  // Gerar tokens para um usuário
  generateTokensForUser: async function (userId: string) {
    const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Armazenar o refresh token no banco de dados
    await prisma.refreshToken.create({
      data: {
        userId,
        hashedToken,
      },
    });

    return { accessToken, refreshToken };
  },

  // Registrar usuário
  register: async function (name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email já cadastrado");

    const slugBase = slugify(name);
    let slug = slugBase;
    let count = 1;

    while (await prisma.user.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${count++}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, slug },
    });

    const tokens = await this.generateTokensForUser(user.id);
    return { user, ...tokens };
  },

  // Login
  login: async function (email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new Error("Usuário não encontrado ou login social utilizado");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error("Senha incorreta");

    const tokens = await this.generateTokensForUser(user.id);
    return { user, ...tokens };
  },

  // Refresh Token
  refreshToken: async (token: string) => {
    if (!token) {
      throw new Error("Refresh token não fornecido");
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { hashedToken },
    });

    if (!refreshToken || refreshToken.revoked) {
      throw new Error("Refresh token inválido ou revogado");
    }

    // Verify the refresh token itself
    try {
      const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
        userId: string;
      };
      // Issue a new access token
      const accessToken = jwt.sign(
        { userId: payload.userId },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION }
      );
      return { accessToken };
    } catch (err) {
      throw new Error("Refresh token expirado ou inválido");
    }
  },

  // Solicitar redefinição de senha
  requestPasswordReset: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Não revele que o usuário não existe
      return {
        message:
          "Se um usuário com este email existir, um link para redefinição de senha será enviado.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hora

    await prisma.user.update({
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
  },

  // Redefinir a senha
  resetPassword: async (token: string, newPassword: string) => {
    if (!token || !newPassword) {
      throw new Error("Token e nova senha são obrigatórios");
    }

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await prisma.user.findFirst({
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Opcional: revogar todos os refresh tokens existentes para segurança
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    return { message: "Senha redefinida com sucesso." };
  },

  // Manter a verificação de token para o middleware, mas usando o secret do access token
  verifyToken: (token: string) => {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: string };
    } catch {
      throw new Error("Token inválido ou expirado");
    }
  },
};
