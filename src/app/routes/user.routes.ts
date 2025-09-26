import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();

// CRUD básico
router.post("/", userController.create); // Criar usuário (público)
router.get("/profile", requireAuth, userController.findAll); // Listar usuários (privado)
router.get("/profile/:slug", optionalAuth, userController.findBySlug); // Perfil por slug (público)
router.get("/:id", optionalAuth, userController.findById); // Perfil por ID (público)
router.put("/:id", requireAuth, userController.update); // Atualizar usuário (privado)
router.delete("/:id", requireAuth, userController.delete); // Deletar usuário (privado)

// Seguidores / Seguindo
router.post("/follow", requireAuth, userController.follow); // Seguir usuário (privado)
router.delete("/unfollow", requireAuth, userController.unfollow); // Deixar de seguir (privado)
router.get("/:id/followers", optionalAuth, userController.getFollowers); // Lista seguidores (público)
router.get("/:id/following", optionalAuth, userController.getFollowing); // Lista seguindo (público)

// Links sociais
router.post("/:id/social-links", requireAuth, userController.addSocialLink); // Adicionar link social (privado)
router.get("/:id/social", optionalAuth, userController.getSocialLinks); // Ver links sociais (público)
router.delete("/:id/social-links", requireAuth, userController.removeSocialLink); // Remover link social (privado)

// Uploads
router.post("/:id/avatar", requireAuth, upload.single("avatar"), userController.uploadAvatar);
router.post("/:id/banner", requireAuth, upload.single("banner"), userController.uploadBanner);

export default router;