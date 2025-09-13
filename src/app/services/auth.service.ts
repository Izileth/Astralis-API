import { prisma } from "../prisma/client";
import { slugify } from "../utils/slugfy";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "izilethdevsecret";

export const authService = {
  // Registrar usuário
  register: async (name: string, email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email já cadastrado");

    const slugBase = slugify(name);
    let slug = slugBase;
    let count = 1;
    
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${count++}`;
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, slug},
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return { user, token };
  },

  // Login
  login: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Usuário não encontrado");

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error("Senha incorreta");

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return { user, token };
  },

  // Verificar token
  verifyToken: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      throw new Error("Token inválido");
    }
  },
};
