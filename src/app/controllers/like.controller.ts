import { Request, Response } from "express";
import { likeService } from "../services/like.service";

export const likeController = {
  likePost: async (req: Request, res: Response) => {
    const { userId, postId } = req.body;
    const like = await likeService.likePost(userId, postId);
    res.status(201).json(like);
  },

  unlikePost: async (req: Request, res: Response) => {
    const { userId, postId } = req.body;
    await likeService.unlikePost(userId, postId);
    res.status(204).send();
  },

  countLikes: async (req: Request, res: Response) => {
    const { postId } = req.params;
    const count = await likeService.countLikes(postId);
    res.json({ postId, likes: count });
  },
};
