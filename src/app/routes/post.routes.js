"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = __importDefault(require("../middleware/upload.middleware"));
const router = (0, express_1.Router)();
// === ROTAS BÁSICAS (CRUD) ===
router.post("/", auth_middleware_1.requireAuth, post_controller_1.postController.create); // Criar post (privado)
router.get("/", auth_middleware_1.optionalAuth, post_controller_1.postController.findAll); // Listar posts com filtros (público)
router.get("/slug/:slug", auth_middleware_1.optionalAuth, post_controller_1.postController.findBySlug); // Post por slug (público)
router.get("/:id", auth_middleware_1.optionalAuth, post_controller_1.postController.findById); // Post por ID (público)
router.put("/:id", auth_middleware_1.requireAuth, post_controller_1.postController.update); // Atualizar post (privado)
router.delete("/:id", auth_middleware_1.requireAuth, post_controller_1.postController.delete); // Deletar post (privado)
// === ROTAS DE CATEGORIAS E TAGS (NOVAS) ===
router.get("/categories/all", auth_middleware_1.optionalAuth, post_controller_1.postController.getAllCategories); // Listar todas categorias (público)
router.get("/tags/all", auth_middleware_1.optionalAuth, post_controller_1.postController.getAllTags); // Listar todas tags (público)
// === ROTAS DE FILTROS (ATUALIZADAS - AGORA POR NOME) ===
router.get("/category/:categoryName", auth_middleware_1.optionalAuth, post_controller_1.postController.findByCategory); // Posts por categoria (público)
router.get("/tag/:tagName", auth_middleware_1.optionalAuth, post_controller_1.postController.findByTag); // Posts por tag (público)
// === ROTAS DE DESCOBERTA (NOVAS) ===
router.get("/discover/most-liked", auth_middleware_1.optionalAuth, post_controller_1.postController.getMostLiked); // Posts mais curtidos (público)
router.get("/discover/recent", auth_middleware_1.optionalAuth, post_controller_1.postController.getRecent); // Posts mais recentes (público)
// === ROTAS DE UTILIDADE (NOVAS) ===
router.get("/utils/stats", auth_middleware_1.optionalAuth, post_controller_1.postController.getStats); // Estatísticas gerais (público)
router.get("/utils/search", auth_middleware_1.optionalAuth, post_controller_1.postController.search); // Busca avançada (público)
// === ROTAS DE AUTOR ===
router.get("/author/:authorId", auth_middleware_1.optionalAuth, post_controller_1.postController.findByAuthor); // Posts por autor (público)
// === ROTAS ESPECÍFICAS DE POST (COM :id) ===
// IMPORTANTE: Essas devem vir por último para não conflitar com outras rotas
router.get("/:id/similar", auth_middleware_1.optionalAuth, post_controller_1.postController.getSimilar); // Posts similares (público)
router.get("/:id/related", auth_middleware_1.optionalAuth, post_controller_1.postController.getRelatedPosts); // Posts relacionados (público)
router.patch("/:id/toggle-publish", auth_middleware_1.requireAuth, post_controller_1.postController.togglePublish); // Publicar/despublicar (privado)
// === ROTAS DE RELAÇÕES ENTRE POSTS ===
router.post("/relations", auth_middleware_1.requireAuth, post_controller_1.postController.addRelation); // Adicionar relação (privado)
router.delete("/relations", auth_middleware_1.requireAuth, post_controller_1.postController.removeRelation); // Remover relação (privado)
// Uploads
router.post("/:id/media", auth_middleware_1.requireAuth, upload_middleware_1.default.single("media"), post_controller_1.postController.uploadMedia);
// Rota para upload de imagem
router.post("/utils/upload-image", auth_middleware_1.requireAuth, upload_middleware_1.default.single("image"), post_controller_1.postController.uploadImage);
exports.default = router;
