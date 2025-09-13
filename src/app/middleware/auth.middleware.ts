import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "izilethdev";

export interface AuthRequest extends Request {
  userId?: string;
}


export const authMiddleware = (accessType: 'private' | 'public') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (accessType === 'public') {
      // Rota pública, segue normalmente
      return next();
    }

    // Rota privada: exige token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = payload.userId;
      next();
    } catch {
      res.status(401).json({ error: "Token expirado ou inválido" });
      return;
    }
  };
};

// Middlewares específicos para facilitar o uso
export const requireAuth = authMiddleware('private');
export const optionalAuth = authMiddleware('public');