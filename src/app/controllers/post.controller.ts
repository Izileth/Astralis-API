import { Request, Response } from "express";
import { postService } from "../services/post.service";

export const postController = {
  create: async (req: Request, res: Response) => {
    try {
      const { authorId, title, content, description, imageUrl, videoUrl, categoryId, tagIds, relatedPostIds, sharedLinks } = req.body;
      const post = await postService.create(authorId, title, content, { description, imageUrl, videoUrl, categoryId, tagIds, relatedPostIds, sharedLinks });
      res.status(201).json(post);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  findAll: async (_req: Request, res: Response) => {
    const posts = await postService.findAll();
    res.json(posts);
  },

  findBySlug: async (req: Request, res: Response) => {
    const { slug } = req.params;
    const post = await postService.findBySlug(slug);
    post ? res.json(post) : res.status(404).json({ error: "Post not found" });
  },

  findById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = await postService.findById(id);
    post ? res.json(post) : res.status(404).json({ error: "Post not found" });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = await postService.update(id, req.body);
    res.json(post);
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await postService.delete(id);
    res.status(204).send();
  },

  findByCategory: async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const posts = await postService.findByCategory(categoryId);
    res.json(posts);
  },

  findByTag: async (req: Request, res: Response) => {
    const { tagId } = req.params;
    const posts = await postService.findByTag(tagId);
    res.json(posts);
  },
};
