import { prisma } from "../prisma/client";
import { slugify } from "../utils/slugfy";
export const postService = {
  // Criar post
  create: async (
    authorId: string,
    title: string,
    content: string,
    options?: {
      description?: string;
      imageUrl?: string;
      videoUrl?: string;
      categoryId?: string;
      tagIds?: string[];
      relatedPostIds?: string[];
      sharedLinks?: { platform: string; url: string }[];
    }
  ) => {
    const { description, imageUrl, videoUrl, categoryId, tagIds, relatedPostIds, sharedLinks } = options || {};

    const slugBase = slugify(title);
    let slug = slugBase;
    let count = 1;

    // Garantir slug único
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${count++}`;
    }


    // Primeiro criar o post
    const post = await prisma.post.create({
      data: {
        authorId,
        title,
        content,
        description,
        slug,
        imageUrl,
        videoUrl,
        categoryId,
        tags: {
          create: tagIds?.map(tagId => ({ tagId })) || [],
        },
        sharedLinks: {
          create: sharedLinks?.map(link => ({ platform: link.platform, url: link.url })) || [],
        },
      },
    });

    // Depois criar as relações se houver
    if (relatedPostIds && relatedPostIds.length > 0) {
      await prisma.postRelation.createMany({
        data: relatedPostIds.map(relatedPostId => ({
          postId: post.id,
          relatedPostId
        })),
        skipDuplicates: true
      });
    }

    // Retornar o post com todas as relações
    return prisma.post.findUnique({
      where: { id: post.id },
      include: { 
        author: true,
        category: true,
        tags: { include: { tag: true } }, 
    
        relatedTo: { include: { relatedPost: true } }, 
        relatedFrom: { include: { post: true } },
        sharedLinks: true 
      },
    });
  },

  // Buscar todos posts
  findAll: async () => {
    return prisma.post.findMany({
      include: { 
        author: true, 
        category: true, 
        tags: { include: { tag: true } }, 
        relatedTo: { include: { relatedPost: true } },
        relatedFrom: { include: { post: true } },
        sharedLinks: true, 
        comments: { include: { author: true } }, 
        likes: { include: { user: true } } 
      },
    });
  },

  // Buscar post por slug
  findBySlug: async (slug: string) => {
    return prisma.post.findUnique({ 
      where: { slug }, 
      include: { 
        author: true, 
        category: true, 
        tags: { include: { tag: true } }, 
        relatedTo: { include: { relatedPost: true } },
        relatedFrom: { include: { post: true } },
        sharedLinks: true, 
        comments: { include: { author: true } }, 
        likes: { include: { user: true } } 
      },
    });
  },

  // Buscar post por ID
  findById: async (id: string) => {
    return prisma.post.findUnique({
      where: { id },
      include: { 
        author: true, 
        category: true, 
        tags: { include: { tag: true } }, 
        relatedTo: { include: { relatedPost: true } },
        relatedFrom: { include: { post: true } },
        sharedLinks: true, 
        comments: { include: { author: true } }, 
        likes: { include: { user: true } } 
      },
    });
  },

  // Atualizar post
  update: async (
    id: string,
    data: Partial<{
      title: string;
      content: string;
      description: string;
      imageUrl: string;
      videoUrl: string;
      categoryId: string;
      tagIds: string[];
      relatedPostIds: string[];
      sharedLinks: { platform: string; url: string }[];
      published: boolean;
    }>
  ) => {
    const { tagIds, relatedPostIds, sharedLinks, ...rest } = data;

    // Atualizar os campos básicos do post
    await prisma.post.update({
      where: { id },
      data: {
        ...rest,
        // Atualizar tags
        tags: tagIds ? { 
          deleteMany: {}, 
          create: tagIds.map(tagId => ({ tagId })) 
        } : undefined,
        // Atualizar links
        sharedLinks: sharedLinks ? { 
          deleteMany: {}, 
          create: sharedLinks.map(link => ({ platform: link.platform, url: link.url })) 
        } : undefined,
      },
    });

    // Atualizar posts relacionados separadamente se fornecido
    if (relatedPostIds !== undefined) {
      // Deletar relações existentes onde este post é o "post principal"
      await prisma.postRelation.deleteMany({
        where: { postId: id }
      });

      // Criar novas relações se houver
      if (relatedPostIds.length > 0) {
        await prisma.postRelation.createMany({
          data: relatedPostIds.map(relatedPostId => ({
            postId: id,
            relatedPostId
          })),
          skipDuplicates: true
        });
      }
    }

    // Retornar o post atualizado com todas as relações
    return prisma.post.findUnique({
      where: { id },
      include: { 
        author: true,
        category: true,
        tags: { include: { tag: true } }, 
        relatedTo: { include: { relatedPost: true } },
        relatedFrom: { include: { post: true } },
        sharedLinks: true 
      },
    });
  },

  // Deletar post
  delete: async (id: string) => {
    // Primeiro deletar as relações
    await prisma.postRelation.deleteMany({
      where: {
        OR: [
          { postId: id },
          { relatedPostId: id }
        ]
      }
    });

    // Depois deletar o post
    return prisma.post.delete({ where: { id } });
  },

  // Buscar posts por categoria
  findByCategory: async (categoryId: string) => {
    return prisma.post.findMany({ 
      where: { categoryId }, 
      include: { 
        author: true, 
        category: true,
        tags: { include: { tag: true } }
      } 
    });
  },

  // Buscar posts por tag
  findByTag: async (tagId: string) => {
    return prisma.post.findMany({
      where: { tags: { some: { tagId } } },
      include: { 
        author: true, 
        category: true, 
        tags: { include: { tag: true } } 
      },
    });
  },

  // Buscar posts relacionados a um post específico
  findRelatedPosts: async (postId: string) => {
    return prisma.post.findUnique({
      where: { id: postId },
      include: {
        relatedTo: {
          include: {
            relatedPost: {
              include: {
                author: true,
                category: true,
                tags: { include: { tag: true } }
              }
            }
          }
        },
        relatedFrom: {
          include: {
            post: {
              include: {
                author: true,
                category: true,
                tags: { include: { tag: true } }
              }
            }
          }
        }
      }
    });
  },

  // Adicionar relação entre posts
  addRelation: async (postId: string, relatedPostId: string) => {
    return prisma.postRelation.create({
      data: {
        postId,
        relatedPostId
      }
    });
  },

  // Remover relação entre posts
  removeRelation: async (postId: string, relatedPostId: string) => {
    return prisma.postRelation.deleteMany({
      where: {
        postId,
        relatedPostId
      }
    });
  }
};