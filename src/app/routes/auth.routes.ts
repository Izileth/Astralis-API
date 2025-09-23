import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import passport from "../config/passport";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

// Rotas de atualização de token e redefinição de senha
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Rotas de autenticação social
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.socialLoginCallback
);

router.get("/discord", passport.authenticate("discord"));
router.get(
  "/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }),
  authController.socialLoginCallback
);


export default router;
