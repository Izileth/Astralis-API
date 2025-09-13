import { prisma } from "../prisma/client";

export const commentService = {
  create: async (authorId: string, postId: string, content: string) => {
    return prisma.comment.create({
      data: { authorId, postId, content },
    });
  },

  findByPost: async (postId: string) => {
    return prisma.comment.findMany({
      where: { postId },
      include: { author: true },
    });
  },

  delete: async (id: string) => {
    return prisma.comment.delete({ where: { id } });
  },
};
