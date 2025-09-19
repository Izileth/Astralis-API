import { Request, Response } from "express";
import { likeService } from "../services/like.service";

export const likeController = {
  // Post Likes
  likePost: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { postId } = req.body;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized: User not authenticated" });
        return;
      }

      if (!postId) {
        res.status(400).json({ error: "Missing required field: postId" });
        return;
      }

      const like = await likeService.likePost(userId, postId);
      res.status(201).json(like);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  unlikePost: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { postId } = req.body;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized: User not authenticated" });
        return;
      }

      if (!postId) {
        res.status(400).json({ error: "Missing required field: postId" });
        return;
      }

      await likeService.unlikePost(userId, postId);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  countLikes: async (req: Request, res: Response) => {
    const { postId } = req.params;
    const count = await likeService.countLikes(postId);
    res.json({ postId, likes: count });
  },

  // Comment Likes
  likeComment: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { commentId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized: User not authenticated" });
        return;
      }

      const like = await likeService.likeComment(userId, commentId);
      res.status(201).json(like);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  unlikeComment: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { commentId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized: User not authenticated" });
        return;
      }

      await likeService.unlikeComment(userId, commentId);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  countCommentLikes: async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const count = await likeService.countCommentLikes(commentId);
    res.json({ commentId, likes: count });
  },
};
