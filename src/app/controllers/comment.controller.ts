import { Request, Response } from "express";
import { commentService } from "../services/comment.service";

export const commentController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const authorId = (req as any).userId;
      const { postId, content } = req.body; // postId vem do body, conforme a rota

      if (!authorId) {
        res.status(401).json({ error: "Unauthorized: User not authenticated" });
        return;
      }

      if (!postId || !content) {
        res.status(400).json({ error: "Missing required fields: postId and content" });
        return;
      }

      const comment = await commentService.create(authorId, postId, content);
      res.status(201).json(comment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  findByPost: async (req: Request, res: Response) => {
    const { postId } = req.params;
    const comments = await commentService.findByPost(postId);
    res.json(comments);
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await commentService.delete(id);
    res.status(204).send();
  },
};
