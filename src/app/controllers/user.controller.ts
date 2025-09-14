import { Request, Response } from "express";
import { userService } from "../services/user.service";

export const userController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, avatarUrl, bannerUrl, bio } = req.body;
      const user = await userService.create(name, email, password, avatarUrl, bannerUrl, bio);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  findAll: async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await userService.findAll();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  findBySlug: async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const user = await userService.findBySlug(slug);
      user ? res.json(user) : res.status(404).json({ error: "User not found" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  findById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);
      user ? res.json(user) : res.status(404).json({ error: "User not found" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await userService.update(id, req.body);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await userService.delete(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  follow: async (req: Request, res: Response): Promise<void> => {
    try {
      const { followerId, followingId } = req.body;
      const follow = await userService.follow(followerId, followingId);
      res.status(201).json(follow);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  unfollow: async (req: Request, res: Response): Promise<void> => {
    try {
      const { followerId, followingId } = req.body;
      await userService.unfollow(followerId, followingId);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  getFollowers: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const followers = await userService.getFollowers(id);
      res.json(followers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getFollowing: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const following = await userService.getFollowing(id);
      res.json(following);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  addSocialLink: async (req: Request, res: Response): Promise<void> => {
    try {
      // Debug completo
      console.log('CONTROLLER - req.params:', req.params);
      console.log('CONTROLLER - req.body:', req.body);
      console.log('CONTROLLER - req.url:', req.url);
      console.log('CONTROLLER - req.method:', req.method);

      // Pegar userId da URL (mais RESTful)
      const { id: userId } = req.params;
      const { platform, url } = req.body;

      // Debug após extração
      console.log('CONTROLLER - Valores extraídos:', { 
        userId, 
        platform, 
        url,
        userIdType: typeof userId,
        platformType: typeof platform,
        urlType: typeof url
      });

      // Validações
      if (!userId) {
        console.log('CONTROLLER - userId está vazio:', userId);
        res.status(400).json({ error: "userId é obrigatório" });
        return;
      }
      if (!platform) {
        console.log('CONTROLLER - platform está vazio:', platform);
        res.status(400).json({ error: "platform é obrigatório" });
        return;
      }
      if (!url) {
        console.log('CONTROLLER - url está vazio:', url);
        res.status(400).json({ error: "url é obrigatório" });
        return;
      }

      console.log('CONTROLLER - Chamando service com:', { userId, platform, url });
      const link = await userService.addSocialLink(userId, platform, url);
      res.status(201).json(link);
    } catch (err: any) {
      console.log('CONTROLLER - Erro:', err.message);
      res.status(400).json({ error: err.message });
    }
  },

  removeSocialLink: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await userService.removeSocialLink(id);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  getSocialLinks: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const links = await userService.getSocialLinks(id);
      res.json(links);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};