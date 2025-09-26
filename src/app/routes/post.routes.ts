import { Router } from "express";
import { postController } from "../controllers/post.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();

// === ROTAS BÁSICAS (CRUD) ===
router.post("/", requireAuth, postController.create); // Criar post (privado)
router.get("/", optionalAuth, postController.findAll); // Listar posts com filtros (público)
router.get("/slug/:slug", optionalAuth, postController.findBySlug); // Post por slug (público)
router.get("/:id", optionalAuth, postController.findById); // Post por ID (público)
router.put("/:id", requireAuth, postController.update); // Atualizar post (privado)
router.delete("/:id", requireAuth, postController.delete); // Deletar post (privado)

// === ROTAS DE CATEGORIAS E TAGS (NOVAS) ===

router.get("/categories/all", optionalAuth, postController.getAllCategories); // Listar todas categorias (público)
router.get("/tags/all", optionalAuth, postController.getAllTags); // Listar todas tags (público)

// === ROTAS DE FILTROS (ATUALIZADAS - AGORA POR NOME) ===
router.get("/category/:categoryName", optionalAuth, postController.findByCategory); // Posts por categoria (público)
router.get("/tag/:tagName", optionalAuth, postController.findByTag); // Posts por tag (público)

// === ROTAS DE DESCOBERTA (NOVAS) ===
router.get("/discover/most-liked", optionalAuth, postController.getMostLiked); // Posts mais curtidos (público)
router.get("/discover/recent", optionalAuth, postController.getRecent); // Posts mais recentes (público)

// === ROTAS DE UTILIDADE (NOVAS) ===
router.get("/utils/stats", optionalAuth, postController.getStats); // Estatísticas gerais (público)
router.get("/utils/search", optionalAuth, postController.search); // Busca avançada (público)

// === ROTAS DE AUTOR ===
router.get("/author/:authorId", optionalAuth, postController.findByAuthor); // Posts por autor (público)

// === ROTAS ESPECÍFICAS DE POST (COM :id) ===
// IMPORTANTE: Essas devem vir por último para não conflitar com outras rotas
router.get("/:id/similar", optionalAuth, postController.getSimilar); // Posts similares (público)
router.get("/:id/related", optionalAuth, postController.getRelatedPosts); // Posts relacionados (público)
router.patch("/:id/toggle-publish", requireAuth, postController.togglePublish); // Publicar/despublicar (privado)

// === ROTAS DE RELAÇÕES ENTRE POSTS ===
router.post("/relations", requireAuth, postController.addRelation); // Adicionar relação (privado)
router.delete("/relations", requireAuth, postController.removeRelation); // Remover relação (privado)

// Uploads
router.post("/:id/media", requireAuth, upload.single("media"), postController.uploadMedia);

export default router;
