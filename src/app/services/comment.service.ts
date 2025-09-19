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

  update: async (commentId: string, userId: string, newContent: string) => {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== userId) {
      throw new Error("Comment not found or user not authorized to edit");
    }

    return prisma.comment.update({
      where: { id: commentId },
      data: { content: newContent },
    });
  },

  delete: async (id: string) => {
    // Adicionar verificação de autorização aqui também seria uma boa prática,
    // mas mantendo o foco na tarefa solicitada.
    return prisma.comment.delete({ where: { id } });
  },
};
