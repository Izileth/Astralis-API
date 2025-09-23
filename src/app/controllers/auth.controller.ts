import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { User } from "../../generated/prisma";
export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  refreshToken: async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  },

  forgotPassword: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  resetPassword: async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  socialLoginCallback: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as User;
      if (!user) {
        res.status(401).json({ error: "Authentication failed." });
        return;
      }

      const tokens = await authService.generateTokensForUser(user.id);

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5656/";
      res.redirect(
        `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
      );
    } catch (err: any) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5656/";
      res.redirect(`${frontendUrl}/login?error=${err.message}`);
    }
  },
};
