import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// CRUD de comentários
router.post("/", requireAuth, commentController.create); // Criar comentário (privado - precisa estar logado)
router.get("/post/:postId", optionalAuth, commentController.findByPost); // Comentários de um post (público)
router.put("/:id", requireAuth, commentController.update); // Atualizar comentário (privado - só o autor)
router.delete("/:id", requireAuth, commentController.delete); // Deletar comentário (privado - só o autor ou dono do post)


export default router;