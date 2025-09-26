"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postController = void 0;
const post_service_1 = require("../services/post.service");
const upload_service_1 = __importDefault(require("../services/upload.service"));
exports.postController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Correção: Alinhar com o auth.middleware.ts, que define `req.userId`.
            const authorId = req.userId;
            if (!authorId) {
                res.status(401).json({ error: "Unauthorized: User ID not found after authentication" });
                return;
            }
            const { title, content, description, imageUrl, videoUrl, categoryName, tagNames, relatedPostIds, sharedLinks } = req.body;
            // Validações básicas
            if (!title || !content) {
                res.status(400).json({
                    error: "Missing required fields: title, content"
                });
                return;
            }
            const post = yield post_service_1.postService.create(authorId, title, content, {
                description,
                imageUrl,
                videoUrl,
                categoryName,
                tagNames,
                relatedPostIds,
                sharedLinks
            });
            res.status(201).json(post);
        }
        catch (err) {
            console.error("Error creating post:", err);
            res.status(400).json({ error: err.message });
        }
    }),
    // Buscar todos os posts com filtros
    findAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { published, categoryName, tagNames, authorId, search, limit, skip } = req.query;
            // Processar filtros
            const filters = {};
            if (published !== undefined) {
                filters.published = published === 'true';
            }
            if (categoryName) {
                filters.categoryName = categoryName;
            }
            if (tagNames) {
                // Suporta tanto string única quanto array
                filters.tagNames = typeof tagNames === 'string'
                    ? [tagNames]
                    : tagNames;
            }
            if (authorId) {
                filters.authorId = authorId;
            }
            if (search) {
                filters.search = search;
            }
            let posts = yield post_service_1.postService.findAll(filters);
            // Aplicar paginação se fornecida
            if (skip || limit) {
                const skipNum = skip ? parseInt(skip) : 0;
                const limitNum = limit ? parseInt(limit) : posts.length;
                posts = posts.slice(skipNum, skipNum + limitNum);
            }
            res.json({
                posts,
                total: posts.length,
                filters: filters
            });
        }
        catch (err) {
            console.error("Error fetching posts:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Buscar post por slug
    findBySlug: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { slug } = req.params;
            const post = yield post_service_1.postService.findBySlug(slug);
            if (!post) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            res.json(post);
        }
        catch (err) {
            console.error("Error fetching post by slug:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Buscar post por ID
    findById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const post = yield post_service_1.postService.findById(id);
            if (!post) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            res.json(post);
        }
        catch (err) {
            console.error("Error fetching post by ID:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Atualizar post
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const post = yield post_service_1.postService.update(id, updateData);
            if (!post) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            res.json(post);
        }
        catch (err) {
            console.error("Error updating post:", err);
            res.status(400).json({ error: err.message });
        }
    }),
    // Deletar post
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const result = yield post_service_1.postService.delete(id);
            res.json(result);
        }
        catch (err) {
            console.error("Error deleting post:", err);
            res.status(400).json({ error: err.message });
        }
    }),
    // Buscar por categoria (agora por nome)
    findByCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { categoryName } = req.params;
            const posts = yield post_service_1.postService.findByCategory(categoryName);
            res.json({
                posts,
                category: categoryName,
                total: posts.length
            });
        }
        catch (err) {
            console.error("Error fetching posts by category:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Buscar por tag (agora por nome)
    findByTag: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { tagName } = req.params;
            const posts = yield post_service_1.postService.findByTag(tagName);
            res.json({
                posts,
                tag: tagName,
                total: posts.length
            });
        }
        catch (err) {
            console.error("Error fetching posts by tag:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // NOVAS FUNCIONALIDADES
    // Listar todas as categorias
    getAllCategories: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const categories = yield post_service_1.postService.getAllCategories();
            res.json({
                categories,
                total: categories.length
            });
        }
        catch (err) {
            console.error("Error fetching categories:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Listar todas as tags
    getAllTags: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tags = yield post_service_1.postService.getAllTags();
            res.json({
                tags,
                total: tags.length
            });
        }
        catch (err) {
            console.error("Error fetching tags:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Posts mais curtidos
    getMostLiked: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { limit = 10 } = req.query;
            const posts = yield post_service_1.postService.getMostLikedPosts(parseInt(limit));
            res.json({
                posts,
                total: posts.length,
                type: 'most_liked'
            });
        }
        catch (err) {
            console.error("Error fetching most liked posts:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Posts mais recentes
    getRecent: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { limit = 10 } = req.query;
            const posts = yield post_service_1.postService.getRecentPosts(parseInt(limit));
            res.json({
                posts,
                total: posts.length,
                type: 'recent'
            });
        }
        catch (err) {
            console.error("Error fetching recent posts:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Posts similares
    getSimilar: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { limit = 5 } = req.query;
            const posts = yield post_service_1.postService.findSimilarPosts(id, parseInt(limit));
            res.json({
                posts,
                total: posts.length,
                relatedTo: id
            });
        }
        catch (err) {
            console.error("Error fetching similar posts:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Posts por autor
    findByAuthor: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { authorId } = req.params;
            const { published, limit, skip } = req.query;
            const filters = {};
            if (published !== undefined) {
                filters.published = published === 'true';
            }
            if (limit) {
                filters.limit = parseInt(limit);
            }
            if (skip) {
                filters.skip = parseInt(skip);
            }
            const posts = yield post_service_1.postService.findByAuthor(authorId, filters);
            res.json({
                posts,
                total: posts.length,
                authorId,
                filters
            });
        }
        catch (err) {
            console.error("Error fetching posts by author:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Buscar posts relacionados
    getRelatedPosts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const relatedData = yield post_service_1.postService.findRelatedPosts(id);
            if (!relatedData) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            // Formatar resposta com posts relacionados
            const relatedPosts = [
                ...relatedData.relatedTo.map(r => (Object.assign(Object.assign({}, r.relatedPost), { relationType: 'related_to' }))),
                ...relatedData.relatedFrom.map(r => (Object.assign(Object.assign({}, r.post), { relationType: 'related_from' })))
            ];
            res.json({
                postId: id,
                relatedPosts,
                total: relatedPosts.length
            });
        }
        catch (err) {
            console.error("Error fetching related posts:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Adicionar relação entre posts
    addRelation: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { postId, relatedPostId } = req.body;
            if (!postId || !relatedPostId) {
                res.status(400).json({
                    error: "Missing required fields: postId, relatedPostId"
                });
                return;
            }
            if (postId === relatedPostId) {
                res.status(400).json({
                    error: "A post cannot be related to itself"
                });
                return;
            }
            const relation = yield post_service_1.postService.addRelation(postId, relatedPostId);
            res.status(201).json({
                message: "Relation created successfully",
                relation
            });
        }
        catch (err) {
            console.error("Error adding post relation:", err);
            res.status(400).json({ error: err.message });
        }
    }),
    // Remover relação entre posts
    removeRelation: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { postId, relatedPostId } = req.body;
            if (!postId || !relatedPostId) {
                res.status(400).json({
                    error: "Missing required fields: postId, relatedPostId"
                });
                return;
            }
            yield post_service_1.postService.removeRelation(postId, relatedPostId);
            res.json({
                message: "Relation removed successfully"
            });
        }
        catch (err) {
            console.error("Error removing post relation:", err);
            res.status(400).json({ error: err.message });
        }
    }),
    // Estatísticas gerais dos posts
    getStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Você pode implementar essas consultas no service se desejar
            const [totalPosts, publishedPosts, categoriesCount, tagsCount] = yield Promise.all([
                post_service_1.postService.findAll({}),
                post_service_1.postService.findAll({ published: true }),
                post_service_1.postService.getAllCategories(),
                post_service_1.postService.getAllTags()
            ]);
            res.json({
                totalPosts: totalPosts.length,
                publishedPosts: publishedPosts.length,
                draftPosts: totalPosts.length - publishedPosts.length,
                totalCategories: categoriesCount.length,
                totalTags: tagsCount.length
            });
        }
        catch (err) {
            console.error("Error fetching stats:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    // Publicar/despublicar post
    togglePublish: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            // Primeiro buscar o post atual
            const currentPost = yield post_service_1.postService.findById(id);
            if (!currentPost) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            // Alterar o status de publicação
            const updatedPost = yield post_service_1.postService.update(id, {
                published: !currentPost.published
            });
            res.json({
                message: `Post ${(updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.published) ? 'published' : 'unpublished'} successfully`,
                post: updatedPost
            });
        }
        catch (err) {
            console.error("Error toggling publish status:", err);
            res.status(400).json({ error: err.message });
        }
    }),
    // Busca avançada
    search: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { query, categoryName, tagNames, authorId, published = true, limit = 20, skip = 0 } = req.query;
            if (!query) {
                res.status(400).json({
                    error: "Search query is required"
                });
                return;
            }
            const filters = {
                search: query,
                published: published === 'true'
            };
            if (categoryName) {
                filters.categoryName = categoryName;
            }
            if (tagNames) {
                filters.tagNames = typeof tagNames === 'string'
                    ? [tagNames]
                    : tagNames;
            }
            if (authorId) {
                filters.authorId = authorId;
            }
            let posts = yield post_service_1.postService.findAll(filters);
            // Aplicar paginação
            const skipNum = parseInt(skip);
            const limitNum = parseInt(limit);
            const total = posts.length;
            posts = posts.slice(skipNum, skipNum + limitNum);
            res.json({
                query,
                posts,
                pagination: {
                    total,
                    limit: limitNum,
                    skip: skipNum,
                    hasMore: skipNum + limitNum < total
                },
                filters
            });
        }
        catch (err) {
            console.error("Error searching posts:", err);
            res.status(500).json({ error: err.message });
        }
    }),
    uploadMedia: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (!req.file) {
                res.status(400).json({ error: "File is required" });
                return;
            }
            const mediaUrl = yield upload_service_1.default.uploadFile(req.file, `posts/${id}`);
            // Determine if it's an image or video based on mimetype
            const isVideo = req.file.mimetype.startsWith('video');
            const updateData = isVideo ? { videoUrl: mediaUrl } : { imageUrl: mediaUrl };
            const post = yield post_service_1.postService.update(id, updateData);
            res.json(post);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    })
};
