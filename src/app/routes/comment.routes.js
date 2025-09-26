"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// CRUD de comentários
router.post("/", auth_middleware_1.requireAuth, comment_controller_1.commentController.create); // Criar comentário (privado - precisa estar logado)
router.get("/post/:postId", auth_middleware_1.optionalAuth, comment_controller_1.commentController.findByPost); // Comentários de um post (público)
router.put("/:id", auth_middleware_1.requireAuth, comment_controller_1.commentController.update); // Atualizar comentário (privado - só o autor)
router.delete("/:id", auth_middleware_1.requireAuth, comment_controller_1.commentController.delete); // Deletar comentário (privado - só o autor ou dono do post)
exports.default = router;
