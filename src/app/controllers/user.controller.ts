import { Request, Response } from "express";
import { userService } from "../services/user.service";

export const userController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, email, password, avatarUrl, bannerUrl, bio } = req.body;
      const user = await userService.create(name, email, password, avatarUrl, bannerUrl, bio);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  findAll: async (_req: Request, res: Response) => {
    const users = await userService.findAll();
    res.json(users);
  },


  findBySlug: async (req: Request, res: Response) => {
    const { slug } = req.params;
    const user = await userService.findBySlug(slug);
    user ? res.json(user) : res.status(404).json({ error: "User not found" });
  },

  findById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.findById(id);
    user ? res.json(user) : res.status(404).json({ error: "User not found" });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.update(id, req.body);
    res.json(user);
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await userService.delete(id);
    res.status(204).send();
  },

  follow: async (req: Request, res: Response) => {
    const { followerId, followingId } = req.body;
    const follow = await userService.follow(followerId, followingId);
    res.status(201).json(follow);
  },

  unfollow: async (req: Request, res: Response) => {
    const { followerId, followingId } = req.body;
    await userService.unfollow(followerId, followingId);
    res.status(204).send();
  },

  getFollowers: async (req: Request, res: Response) => {
    const { id } = req.params;
    const followers = await userService.getFollowers(id);
    res.json(followers);
  },

  getFollowing: async (req: Request, res: Response) => {
    const { id } = req.params;
    const following = await userService.getFollowing(id);
    res.json(following);
  },

  addSocialLink: async (req: Request, res: Response) => {
    const { userId, platform, url } = req.body;
    const link = await userService.addSocialLink(userId, platform, url);
    res.status(201).json(link);
  },

  removeSocialLink: async (req: Request, res: Response) => {
    const { id } = req.params;
    await userService.removeSocialLink(id);
    res.status(204).send();
  },

  getSocialLinks: async (req: Request, res: Response) => {
    const { id } = req.params;
    const links = await userService.getSocialLinks(id);
    res.json(links);
  },
};
