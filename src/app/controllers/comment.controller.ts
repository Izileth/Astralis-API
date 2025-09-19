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

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { id: commentId } = req.params;
      const { content } = req.body;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized: User not authenticated" });
        return;
      }

      if (!content) {
        res.status(400).json({ error: "Missing required field: content" });
        return;
      }

      const updatedComment = await commentService.update(commentId, userId, content);
      res.status(200).json(updatedComment);
    } catch (err: any) {
      // O service lança erro se não encontrar ou o usuário não for autorizado
      res.status(403).json({ error: err.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await commentService.delete(id);
    res.status(204).send();
  },
};
