
import { Router } from "express";
import { likeController } from "../controllers/like.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Ações de curtida (todas precisam de autenticação)
router.post("/", requireAuth, likeController.likePost); // Curtir post (privado)
router.delete("/", requireAuth, likeController.unlikePost); // Descurtir post (privado)

// Informações sobre curtidas (públicas)
router.get("/count/:postId", optionalAuth, likeController.countLikes); // Contar curtidas (público)


export default router;