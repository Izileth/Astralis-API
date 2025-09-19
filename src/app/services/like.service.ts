import { prisma } from "../prisma/client";

export const likeService = {
  // Post Likes
  likePost: async (userId: string, postId: string) => {
    return prisma.like.create({
      data: { userId, postId },
    });
  },

  unlikePost: async (userId: string, postId: string) => {
    return prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });
  },

  countLikes: async (postId: string) => {
    return prisma.like.count({ where: { postId } });
  },

  // Comment Likes
  likeComment: async (userId: string, commentId: string) => {
    // Opcional: verificar se o comentário existe primeiro
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new Error("Comment not found");
    }

    return prisma.like.create({
      data: { userId, commentId },
    });
  },

  unlikeComment: async (userId: string, commentId: string) => {
    return prisma.like.delete({
      where: { userId_commentId: { userId, commentId } },
    });
  },

  countCommentLikes: async (commentId: string) => {
    return prisma.like.count({ where: { commentId } });
  },
};
