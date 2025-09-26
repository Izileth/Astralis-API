"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const like_controller_1 = require("../controllers/like.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Ações de curtida em POSTS
router.post("/posts", auth_middleware_1.requireAuth, like_controller_1.likeController.likePost); // Curtir post (privado)
router.delete("/posts", auth_middleware_1.requireAuth, like_controller_1.likeController.unlikePost); // Descurtir post (privado)
router.get("/posts/count/:postId", auth_middleware_1.optionalAuth, like_controller_1.likeController.countLikes); // Contar curtidas de post (público)
// Ações de curtida em COMENTÁRIOS
router.post("/comments/:commentId", auth_middleware_1.requireAuth, like_controller_1.likeController.likeComment); // Curtir comentário (privado)
router.delete("/comments/:commentId", auth_middleware_1.requireAuth, like_controller_1.likeController.unlikeComment); // Descurtir comentário (privado)
router.get("/comments/count/:commentId", auth_middleware_1.optionalAuth, like_controller_1.likeController.countCommentLikes); // Contar curtidas de comentário (público)
exports.default = router;
