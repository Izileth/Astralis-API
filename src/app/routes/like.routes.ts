
import { Router } from "express";
import { likeController } from "../controllers/like.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Ações de curtida em POSTS
router.post("/posts", requireAuth, likeController.likePost); // Curtir post (privado)
router.delete("/posts", requireAuth, likeController.unlikePost); // Descurtir post (privado)
router.get("/posts/count/:postId", optionalAuth, likeController.countLikes); // Contar curtidas de post (público)

// Ações de curtida em COMENTÁRIOS
router.post("/comments/:commentId", requireAuth, likeController.likeComment); // Curtir comentário (privado)
router.delete("/comments/:commentId", requireAuth, likeController.unlikeComment); // Descurtir comentário (privado)
router.get("/comments/count/:commentId", optionalAuth, likeController.countCommentLikes); // Contar curtidas de comentário (público)


export default router;