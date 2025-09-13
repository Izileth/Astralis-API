import { prisma } from "../prisma/client";

export const likeService = {
  likePost: async (userId: string, postId: string) => {
    return prisma.like.create({
      data: { userId, postId },
    });
  },

  unlikePost: async (userId: string, postId: string) => {
    return prisma.like.delete({
      where: { postId_userId: { postId, userId } },
    });
  },

  countLikes: async (postId: string) => {
    return prisma.like.count({ where: { postId } });
  },
};
