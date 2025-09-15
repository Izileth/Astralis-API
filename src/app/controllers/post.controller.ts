import { Request, Response } from "express";
import { postService } from "../services/post.service";

export const postController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        authorId, 
        title, 
        content, 
        description, 
        imageUrl, 
        videoUrl, 
        categoryName,  // Mudança: recebe nome da categoria
        tagNames,      // Mudança: recebe array de nomes das tags
        relatedPostIds, 
        sharedLinks 
      } = req.body;

      // Validações básicas
      if (!authorId || !title || !content) {
        res.status(400).json({ 
          error: "Missing required fields: authorId, title, content" 
        });
        return;
      }

      const post = await postService.create(authorId, title, content, { 
        description, 
        imageUrl, 
        videoUrl, 
        categoryName, 
        tagNames, 
        relatedPostIds, 
        sharedLinks 
      });

      res.status(201).json(post);
    } catch (err: any) {
      console.error("Error creating post:", err);
      res.status(400).json({ error: err.message });
    }
  },

  // Buscar todos os posts com filtros
  findAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        published, 
        categoryName, 
        tagNames, 
        authorId, 
        search,
        limit,
        skip 
      } = req.query;

      // Processar filtros
      const filters: any = {};
      
      if (published !== undefined) {
        filters.published = published === 'true';
      }
      
      if (categoryName) {
        filters.categoryName = categoryName as string;
      }
      
      if (tagNames) {
        // Suporta tanto string única quanto array
        filters.tagNames = typeof tagNames === 'string' 
          ? [tagNames] 
          : tagNames as string[];
      }
      
      if (authorId) {
        filters.authorId = authorId as string;
      }
      
      if (search) {
        filters.search = search as string;
      }

      let posts = await postService.findAll(filters);

      // Aplicar paginação se fornecida
      if (skip || limit) {
        const skipNum = skip ? parseInt(skip as string) : 0;
        const limitNum = limit ? parseInt(limit as string) : posts.length;
        posts = posts.slice(skipNum, skipNum + limitNum);
      }

      res.json({
        posts,
        total: posts.length,
        filters: filters
      });
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Buscar post por slug
  findBySlug: async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const post = await postService.findBySlug(slug);
      
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      res.json(post);
    } catch (err: any) {
      console.error("Error fetching post by slug:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Buscar post por ID
  findById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const post = await postService.findById(id);
      
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      res.json(post);
    } catch (err: any) {
      console.error("Error fetching post by ID:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Atualizar post
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const post = await postService.update(id, updateData);
      
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      res.json(post);
    } catch (err: any) {
      console.error("Error updating post:", err);
      res.status(400).json({ error: err.message });
    }
  },

  // Deletar post
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await postService.delete(id);
      res.json(result);
    } catch (err: any) {
      console.error("Error deleting post:", err);
      res.status(400).json({ error: err.message });
    }
  },

  // Buscar por categoria (agora por nome)
  findByCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryName } = req.params;
      const posts = await postService.findByCategory(categoryName);
      
      res.json({
        posts,
        category: categoryName,
        total: posts.length
      });
    } catch (err: any) {
      console.error("Error fetching posts by category:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Buscar por tag (agora por nome)
  findByTag: async (req: Request, res: Response): Promise<void> => {
    try {
      const { tagName } = req.params;
      const posts = await postService.findByTag(tagName);
      
      res.json({
        posts,
        tag: tagName,
        total: posts.length
      });
    } catch (err: any) {
      console.error("Error fetching posts by tag:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // NOVAS FUNCIONALIDADES

  // Listar todas as categorias
  getAllCategories: async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await postService.getAllCategories();
      res.json({
        categories,
        total: categories.length
      });
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Listar todas as tags
  getAllTags: async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await postService.getAllTags();
      res.json({
        tags,
        total: tags.length
      });
    } catch (err: any) {
      console.error("Error fetching tags:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Posts mais curtidos
  getMostLiked: async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;
      const posts = await postService.getMostLikedPosts(parseInt(limit as string));
      
      res.json({
        posts,
        total: posts.length,
        type: 'most_liked'
      });
    } catch (err: any) {
      console.error("Error fetching most liked posts:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Posts mais recentes
  getRecent: async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;
      const posts = await postService.getRecentPosts(parseInt(limit as string));
      
      res.json({
        posts,
        total: posts.length,
        type: 'recent'
      });
    } catch (err: any) {
      console.error("Error fetching recent posts:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Posts similares
  getSimilar: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;
      
      const posts = await postService.findSimilarPosts(id, parseInt(limit as string));
      
      res.json({
        posts,
        total: posts.length,
        relatedTo: id
      });
    } catch (err: any) {
      console.error("Error fetching similar posts:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Posts por autor
  findByAuthor: async (req: Request, res: Response): Promise<void> => {
    try {
      const { authorId } = req.params;
      const { published, limit, skip } = req.query;

      const filters: any = {};
      
      if (published !== undefined) {
        filters.published = published === 'true';
      }
      
      if (limit) {
        filters.limit = parseInt(limit as string);
      }
      
      if (skip) {
        filters.skip = parseInt(skip as string);
      }

      const posts = await postService.findByAuthor(authorId, filters);
      
      res.json({
        posts,
        total: posts.length,
        authorId,
        filters
      });
    } catch (err: any) {
      console.error("Error fetching posts by author:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Buscar posts relacionados
  getRelatedPosts: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const relatedData = await postService.findRelatedPosts(id);
      
      if (!relatedData) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      // Formatar resposta com posts relacionados
      const relatedPosts = [
        ...relatedData.relatedTo.map(r => ({ 
          ...r.relatedPost, 
          relationType: 'related_to' 
        })),
        ...relatedData.relatedFrom.map(r => ({ 
          ...r.post, 
          relationType: 'related_from' 
        }))
      ];

      res.json({
        postId: id,
        relatedPosts,
        total: relatedPosts.length
      });
    } catch (err: any) {
      console.error("Error fetching related posts:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Adicionar relação entre posts
  addRelation: async (req: Request, res: Response): Promise<void> => {
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

      const relation = await postService.addRelation(postId, relatedPostId);
      
      res.status(201).json({
        message: "Relation created successfully",
        relation
      });
    } catch (err: any) {
      console.error("Error adding post relation:", err);
      res.status(400).json({ error: err.message });
    }
  },

  // Remover relação entre posts
  removeRelation: async (req: Request, res: Response): Promise<void> => {
    try {
      const { postId, relatedPostId } = req.body;

      if (!postId || !relatedPostId) {
        res.status(400).json({ 
          error: "Missing required fields: postId, relatedPostId" 
        });
        return;
      }

      await postService.removeRelation(postId, relatedPostId);
      
      res.json({
        message: "Relation removed successfully"
      });
    } catch (err: any) {
      console.error("Error removing post relation:", err);
      res.status(400).json({ error: err.message });
    }
  },

  // Estatísticas gerais dos posts
  getStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Você pode implementar essas consultas no service se desejar
      const [totalPosts, publishedPosts, categoriesCount, tagsCount] = await Promise.all([
        postService.findAll({}),
        postService.findAll({ published: true }),
        postService.getAllCategories(),
        postService.getAllTags()
      ]);

      res.json({
        totalPosts: totalPosts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: totalPosts.length - publishedPosts.length,
        totalCategories: categoriesCount.length,
        totalTags: tagsCount.length
      });
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Publicar/despublicar post
  togglePublish: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Primeiro buscar o post atual
      const currentPost = await postService.findById(id);
      
      if (!currentPost) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      // Alterar o status de publicação
      const updatedPost = await postService.update(id, {
        published: !currentPost.published
      });

      res.json({
        message: `Post ${updatedPost?.published ? 'published' : 'unpublished'} successfully`,
        post: updatedPost
      });
    } catch (err: any) {
      console.error("Error toggling publish status:", err);
      res.status(400).json({ error: err.message });
    }
  },

  // Busca avançada
  search: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        query, 
        categoryName, 
        tagNames, 
        authorId, 
        published = true,
        limit = 20,
        skip = 0
      } = req.query;

      if (!query) {
        res.status(400).json({ 
          error: "Search query is required" 
        });
        return;
      }

      const filters: any = {
        search: query as string,
        published: published === 'true'
      };

      if (categoryName) {
        filters.categoryName = categoryName as string;
      }

      if (tagNames) {
        filters.tagNames = typeof tagNames === 'string' 
          ? [tagNames] 
          : tagNames as string[];
      }

      if (authorId) {
        filters.authorId = authorId as string;
      }

      let posts = await postService.findAll(filters);

      // Aplicar paginação
      const skipNum = parseInt(skip as string);
      const limitNum = parseInt(limit as string);
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
    } catch (err: any) {
      console.error("Error searching posts:", err);
      res.status(500).json({ error: err.message });
    }
  }
};