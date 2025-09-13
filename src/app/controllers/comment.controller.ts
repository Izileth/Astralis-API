import { Request, Response } from "express";
import { commentService } from "../services/comment.service";

export const commentController = {
  create: async (req: Request, res: Response) => {
    const { authorId, postId, content } = req.body;
    const comment = await commentService.create(authorId, postId, content);
    res.status(201).json(comment);
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
