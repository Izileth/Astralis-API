import { Router } from "express";
import { postController } from "../controllers/post.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// CRUD
router.post("/", requireAuth, postController.create); // Criar post (privado - precisa estar logado)
router.get("/", optionalAuth, postController.findAll); // Listar posts (público - mas pode mostrar info do usuário se logado)
router.get("/slug/:slug", optionalAuth, postController.findBySlug); // Post por slug (público)
router.get("/:id", optionalAuth, postController.findById); // Post por ID (público)
router.put("/:id", requireAuth, postController.update); // Atualizar post (privado - só o autor)
router.delete("/:id", requireAuth, postController.delete); // Deletar post (privado - só o autor)

// Filtros
router.get("/category/:categoryId", optionalAuth, postController.findByCategory); // Posts por categoria (público)
router.get("/tag/:tagId", optionalAuth, postController.findByTag); // Posts por tag (público)

// Rotas extras úteis

//router.get("/author/:authorId", optionalAuth, postController.findByAuthor); // Posts por autor (público)
//router.patch("/:id/publish", requireAuth, postController.togglePublish); // Publicar/despublicar post (privado)
//router.get("/user/drafts", requireAuth, postController.findUserDrafts); // Rascunhos do usuário (privado)

export default router;