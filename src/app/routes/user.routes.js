"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = __importDefault(require("../middleware/upload.middleware"));
const router = (0, express_1.Router)();
// CRUD básico
router.post("/", user_controller_1.userController.create); // Criar usuário (público)
router.get("/profile", auth_middleware_1.requireAuth, user_controller_1.userController.findAll); // Listar usuários (privado)
router.get("/profile/:slug", auth_middleware_1.optionalAuth, user_controller_1.userController.findBySlug); // Perfil por slug (público)
router.get("/:id", auth_middleware_1.optionalAuth, user_controller_1.userController.findById); // Perfil por ID (público)
router.put("/:id", auth_middleware_1.requireAuth, user_controller_1.userController.update); // Atualizar usuário (privado)
router.delete("/:id", auth_middleware_1.requireAuth, user_controller_1.userController.delete); // Deletar usuário (privado)
// Seguidores / Seguindo
router.post("/follow", auth_middleware_1.requireAuth, user_controller_1.userController.follow); // Seguir usuário (privado)
router.delete("/unfollow", auth_middleware_1.requireAuth, user_controller_1.userController.unfollow); // Deixar de seguir (privado)
router.get("/:id/followers", auth_middleware_1.optionalAuth, user_controller_1.userController.getFollowers); // Lista seguidores (público)
router.get("/:id/following", auth_middleware_1.optionalAuth, user_controller_1.userController.getFollowing); // Lista seguindo (público)
// Links sociais
router.post("/:id/social-links", auth_middleware_1.requireAuth, user_controller_1.userController.addSocialLink); // Adicionar link social (privado)
router.get("/:id/social", auth_middleware_1.optionalAuth, user_controller_1.userController.getSocialLinks); // Ver links sociais (público)
router.delete("/:id/social-links", auth_middleware_1.requireAuth, user_controller_1.userController.removeSocialLink); // Remover link social (privado)
// Uploads
router.post("/:id/avatar", auth_middleware_1.requireAuth, upload_middleware_1.default.single("avatar"), user_controller_1.userController.uploadAvatar);
router.post("/:id/banner", auth_middleware_1.requireAuth, upload_middleware_1.default.single("banner"), user_controller_1.userController.uploadBanner);
exports.default = router;
