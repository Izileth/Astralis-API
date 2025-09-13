import { prisma } from "../prisma/client";
import { slugify } from "../utils/slugfy";
export const userService = {
  // Criar usuário
  create: async (name: string, email: string, password: string, avatarUrl?: string, bannerUrl?: string, bio?: string) => {
    const slugBase = slugify(name);
    let slug = slugBase;
    let count = 1;
    
    // Garantir slug único
    while (await prisma.user.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${count++}`;
    }
    return prisma.user.create({
      data: { name, email, password, avatarUrl, bannerUrl, bio, slug },
    });
  },


  // Buscar todos usuários
  findAll: async () => {
    return prisma.user.findMany({
      include: { posts: true, comments: true, followers: true, following: true, socialLinks: true },
    });
  },

  // Buscar usuário por slug
  findBySlug: async (slug: string) => {
    return prisma.user.findUnique({ where: { slug }, select: {  name: true, bio: true, bannerUrl: true, status: true, email: true,  avatarUrl: true,  posts: true, comments: true, followers: true, following: true, socialLinks: true }, });
  },

  // Buscar usuário por ID
  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    
      select: { name: true, email: true, bio: true, bannerUrl: true, status: true,  avatarUrl: true,  posts: true, comments: true, followers: true, following: true, socialLinks: true },
    });
  },

  // Atualizar usuário
  update: async (
    id: string,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      avatarUrl: string;
      bannerUrl: string;
      bio: string;
      status: string;
      verified: boolean;
    }>
  ) => {
    return prisma.user.update({ where: { id }, data });
  },

  // Deletar usuário
  delete: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  },

  // Seguir outro usuário
  follow: async (followerId: string, followingId: string) => {
    if (followerId === followingId) throw new Error("Usuário não pode seguir a si mesmo");
    return prisma.follow.create({
      data: { followerId, followingId },
    });
  },

  // Deixar de seguir
  unfollow: async (followerId: string, followingId: string) => {
    return prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  },

  // Listar seguidores
  getFollowers: async (userId: string) => {
    return prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });
  },

  // Listar seguindo
  getFollowing: async (userId: string) => {
    return prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
    });
  },

  // Adicionar link social
  addSocialLink: async (userId: string, platform: string, url: string) => {
    return prisma.socialLink.create({
      data: { userId, platform, url },
    });
  },

  // Remover link social
  removeSocialLink: async (id: string) => {
    return prisma.socialLink.delete({ where: { id } });
  },

  // Listar links sociais
  getSocialLinks: async (userId: string) => {
    return prisma.socialLink.findMany({ where: { userId } });
  },
};
