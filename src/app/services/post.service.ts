import { prisma } from "../prisma/client";
import { slugify } from "../utils/slugfy";

export type PostWithRelations = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;

  authorId: string;
  author?: {
    id: string;
    name: string;
    slug: string;
    email?: string;          // obrigatório no schema
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    bio?: string | null;
    status?: string | null;
    verified: boolean;
  };

  categoryId?: string | null;
  category: {
    id: string;
    name: string;
  } | null;

  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    authorId: string;
    author: {
      id: string;
      name: string;
      slug: string;
      email?: string;          
      avatarUrl?: string | null;
      verified: boolean;
    };
  }>;

  tags: Array<{
    postId: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
    };
  }>;

  likes: Array<{
    id: string;
    userId: string;
  }>;

  sharedLinks: Array<{
    id: string;
    platform: string;
    url: string;
    postId: string;
  }>;

  relatedTo: Array<{
    id: string;
    postId: string;
    relatedPostId: string;
    relatedPost: {
      id: string;
      title: string;
      slug: string;
      author: {
        id: string;
        name: string;
        email?: string;
      };
      category: {
        id: string;
        name: string;
      } | null;
    };
  }>;

  relatedFrom: Array<{
    id: string;
    postId: string;
    relatedPostId: string;
    post: {
      id: string;
      title: string;
      slug: string;
      author: {
        id: string;
        name: string;
        email?: string;
      };
      category: {
        id: string;
        name: string;
      } | null;
    };
  }>;

  _count?: {
    likes: number;
    comments: number;
  };
};


export const postService = {

  findByIdOrThrow: async (id: string): Promise<PostWithRelations> => {
    const post = await postService.findById(id);
    
    if (!post) {
      throw new Error(`Post with id '${id}' not found`);
    }

    
    return post;
  },

  create: async (
    authorId: string,
    title: string,
    content: string,
    options?: {
      description?: string;
      imageUrl?: string;
      videoUrl?: string;
      categoryName?: string;
      tagNames?: string[];
      relatedPostIds?: string[];
      sharedLinks?: { platform: string; url: string }[];
    }
  ): Promise<PostWithRelations> => {
    try {
      const { description, imageUrl, videoUrl, categoryName, tagNames, relatedPostIds, sharedLinks } = options || {};

      const slugBase = slugify(title);
      let slug = slugBase;
      let count = 1;

      // Garantir slug único
      while (await prisma.post.findUnique({ where: { slug } })) {
        slug = `${slugBase}-${count++}`;
      }

      // Criar ou buscar categoria se fornecida
      let categoryId: string | undefined;
      if (categoryName) {
        const category = await prisma.category.upsert({
          where: { name: categoryName },
          update: {},
          create: { name: categoryName }
        });
        categoryId = category.id;
      }

      // Criar ou buscar tags se fornecidas
      let tagConnections: { tagId: string }[] = [];
      if (tagNames && tagNames.length > 0) {
        const tagPromises = tagNames.map(tagName =>
          prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          })
        );
        const tags = await Promise.all(tagPromises);
        tagConnections = tags.map(tag => ({ tagId: tag.id }));
      }

      // Criar o post
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
            create: tagConnections,
          },
          sharedLinks: {
            create: sharedLinks?.map(link => ({ platform: link.platform, url: link.url })) || [],
          },
        },
      });

      // Criar as relações se houver
      if (relatedPostIds && relatedPostIds.length > 0) {
        await prisma.postRelation.createMany({
          data: relatedPostIds.map(relatedPostId => ({
            postId: post.id,
            relatedPostId
          })),
          skipDuplicates: true
        });
      }

      // USAR O MÉTODO SEGURO - garante retorno tipado ou erro
      return await postService.findByIdOrThrow(post.id);

    } catch (error) {
      console.error('Error creating post:', error);
      throw error; // Re-lança o erro para que o controller possa capturar
    }
  },


  // Buscar todos posts
  findAll: async (filters?: {
    published?: boolean;
    categoryName?: string;
    tagNames?: string[];
    authorId?: string;
    search?: string;
  }) => {
    const where: any = {};

    if (filters?.published !== undefined) {
      where.published = filters.published;
    }

    if (filters?.categoryName) {
      where.category = {
        name: {
          contains: filters.categoryName,
          mode: 'insensitive'
        }
      };
    }

    if (filters?.tagNames && filters.tagNames.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: filters.tagNames
            }
          }
        }
      };
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          category: {
            name: {
              contains: filters.search,
              mode: 'insensitive'
            }
          }
        },
        {
          tags: {
            some: {
              tag: {
                name: {
                  contains: filters.search,
                  mode: 'insensitive'
                }
              }
            }
          }
        }
      ];
    }

    return prisma.post.findMany({
      where,
      include: { 
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true
          }
        }, 
        category: true, 
        tags: { include: { tag: true } }, 
        relatedTo: { 
          include: { 
            relatedPost: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                description: true
              }
            }
          } 
        },
        relatedFrom: { 
          include: { 
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                description: true
              }
            }
          } 
        },
        sharedLinks: true,
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  // Buscar post por slug
  findBySlug: async (slug: string) => {
    return prisma.post.findUnique({ 
      where: { slug }, 
      include: { 
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true,
            bio: true
          }
        }, 
        category: true, 
        tags: { include: { tag: true } }, 
        relatedTo: { 
          include: { 
            relatedPost: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    avatarUrl: true
                  }
                },
                category: true,
                _count: {
                  select: {
                    likes: true,
                    comments: true
                  }
                }
              }
            }
          } 
        },
        relatedFrom: { 
          include: { 
            post: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    avatarUrl: true
                  }
                },
                category: true,
                _count: {
                  select: {
                    likes: true,
                    comments: true
                  }
                }
              }
            }
          } 
        },
        sharedLinks: true, 
        comments: { 
          include: { 
            author: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatarUrl: true,
                verified: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }, 
        likes: { 
          include: { 
            user: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatarUrl: true
              }
            }
          } 
        } 
      },
    });
  },

  // Buscar post por ID
  findById: async (id: string) => {
    return prisma.post.findUnique({
      where: { id },
      include: { 
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true,
            bio: true
          }
        }, 
        category: true, 
        tags: { include: { tag: true } }, 
        relatedTo: { 
          include: { 
            relatedPost: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    avatarUrl: true
                  }
                },
                category: true
              }
            }
          } 
        },
        relatedFrom: { 
          include: { 
            post: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    avatarUrl: true
                  }
                },
                category: true
              }
            }
          } 
        },
        sharedLinks: true, 
        comments: { 
          include: { 
            author: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatarUrl: true,
                verified: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }, 
        likes: { 
          include: { 
            user: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatarUrl: true
              }
            }
          } 
        } 
      },
    });
  },

  // Atualizar post com sistema dinâmico
  update: async (
    id: string,
    data: Partial<{
      title: string;
      content: string;
      description: string;
      imageUrl: string;
      videoUrl: string;
      categoryName: string;
      tagNames: string[];
      relatedPostIds: string[];
      sharedLinks: { platform: string; url: string }[];
      published: boolean;
    }>
  ): Promise<PostWithRelations> => {
    try {
      const { tagNames, relatedPostIds, sharedLinks, categoryName, ...rest } = data;

      // Verificar se o post existe antes de tentar atualizar
      const existingPost = await prisma.post.findUnique({ where: { id } });
      if (!existingPost) {
        throw new Error(`Post with id '${id}' not found`);
      }

      // Processar categoria se fornecida
      let categoryId: string | undefined | null = undefined;
      if (categoryName !== undefined) {
        if (categoryName) {
          const category = await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName }
          });
          categoryId = category.id;
        } else {
          categoryId = null; // Remove categoria se string vazia
        }
      }

      // Processar tags se fornecidas
      let tagConnections: { tagId: string }[] = [];
      if (tagNames !== undefined) {
        if (tagNames && tagNames.length > 0) {
          const tagPromises = tagNames.map(tagName =>
            prisma.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName }
            })
          );
          const tags = await Promise.all(tagPromises);
          tagConnections = tags.map(tag => ({ tagId: tag.id }));
        }
      }

      // Atualizar os campos básicos do post
      await prisma.post.update({
        where: { id },
        data: {
          ...rest,
          ...(categoryId !== undefined && { categoryId }),
          // Atualizar tags se fornecidas
          ...(tagNames !== undefined && {
            tags: {
              deleteMany: {},
              create: tagConnections
            }
          }),
          // Atualizar links se fornecidos
          ...(sharedLinks !== undefined && {
            sharedLinks: {
              deleteMany: {},
              create: sharedLinks.map(link => ({ platform: link.platform, url: link.url }))
            }
          }),
        },
      });

      // Atualizar posts relacionados separadamente se fornecido
      if (relatedPostIds !== undefined) {
        await prisma.postRelation.deleteMany({
          where: { postId: id }
        });

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

      // USAR O MÉTODO SEGURO - garante retorno tipado ou erro
      return await postService.findByIdOrThrow(id);

    } catch (error) {
      console.error('Error updating post:', error);
      throw error; // Re-lança o erro para que o controller possa capturar
    }
  },

  // Deletar post com limpeza de categorias e tags não utilizadas
  delete: async (id: string) => {
    // Buscar o post para obter suas relações antes da transação
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        category: true,
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Usar uma transação para garantir que todas as operações sejam bem-sucedidas ou nenhuma delas
    await prisma.$transaction(async (tx) => {
      // 1. Remover todas as relações que dependem do post
      await tx.postRelation.deleteMany({
        where: { OR: [{ postId: id }, { relatedPostId: id }] },
      });
      await tx.postTag.deleteMany({ where: { postId: id } });
      await tx.comment.deleteMany({ where: { postId: id } });
      await tx.like.deleteMany({ where: { postId: id } });
      await tx.sharedLink.deleteMany({ where: { postId: id } });

      // 2. Agora, deletar o post com segurança
      await tx.post.delete({ where: { id } });

      // 3. Limpar tags órfãs (tags que não estão mais associadas a nenhum post)
      for (const postTag of post.tags) {
        const tagUsageCount = await tx.postTag.count({
          where: { tagId: postTag.tag.id },
        });

        if (tagUsageCount === 0) {
          await tx.tag.delete({ where: { id: postTag.tag.id } });
        }
      }

      // 4. Limpar categoria órfã se não tiver mais posts
      if (post.category) {
        const categoryUsageCount = await tx.post.count({
          where: { categoryId: post.category.id },
        });

        if (categoryUsageCount === 0) {
          await tx.category.delete({ where: { id: post.category.id } });
        }
      }
    });

    return { success: true, message: "Post deleted successfully" };
  },

  // Buscar posts por categoria (agora por nome)
  findByCategory: async (categoryName: string) => {
    return prisma.post.findMany({ 
      where: { 
        category: {
          name: {
            contains: categoryName,
            mode: 'insensitive'
          }
        }
      }, 
      include: { 
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true
          }
        }, 
        category: true,
        tags: { include: { tag: true } },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  // Buscar posts por tag (agora por nome)
  findByTag: async (tagName: string) => {
    return prisma.post.findMany({
      where: { 
        tags: { 
          some: { 
            tag: {
              name: {
                contains: tagName,
                mode: 'insensitive'
              }
            }
          } 
        } 
      },
      include: { 
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true
          }
        }, 
        category: true, 
        tags: { include: { tag: true } },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  // NOVAS FUNÇÕES

  // Listar todas as categorias com contagem de posts
  getAllCategories: async () => {
    return prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  // Listar todas as tags com contagem de posts
  getAllTags: async () => {
    return prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  // Buscar posts mais curtidos
  getMostLikedPosts: async (limit: number = 10) => {
    return prisma.post.findMany({
      where: {
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true
          }
        },
        category: true,
        tags: { include: { tag: true } },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        likes: {
          _count: 'desc'
        }
      },
      take: limit
    });
  },

  // Buscar posts mais recentes
  getRecentPosts: async (limit: number = 10) => {
    return prisma.post.findMany({
      where: {
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true
          }
        },
        category: true,
        tags: { include: { tag: true } },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  },

  // Buscar posts relacionados por categoria e tags
  findSimilarPosts: async (postId: string, limit: number = 5) => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        category: true,
        tags: { include: { tag: true } }
      }
    });

    if (!post) return [];

    const tagIds = post.tags.map(pt => pt.tag.id);

    return prisma.post.findMany({
      where: {
        AND: [
          { id: { not: postId } },
          { published: true },
          {
            OR: [
              ...(post.categoryId ? [{ categoryId: post.categoryId }] : []),
              ...(tagIds.length > 0 ? [{
                tags: {
                  some: {
                    tagId: {
                      in: tagIds
                    }
                  }
                }
              }] : [])
            ]
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true
          }
        },
        category: true,
        tags: { include: { tag: true } },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  // Buscar posts do autor
  findByAuthor: async (authorId: string, filters?: {
    published?: boolean;
    limit?: number;
    skip?: number;
  }) => {
    const { published, limit, skip } = filters || {};

    return prisma.post.findMany({
      where: {
        authorId,
        ...(published !== undefined && { published })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            verified: true
          }
        },
        category: true,
        tags: { include: { tag: true } },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit && { take: limit }),
      ...(skip && { skip })
    });
  },

  // Funcões de relação mantidas
  findRelatedPosts: async (postId: string) => {
    return prisma.post.findUnique({
      where: { id: postId },
      include: {
        relatedTo: {
          include: {
            relatedPost: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    avatarUrl: true
                  }
                },
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
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    avatarUrl: true
                  }
                },
                category: true,
                tags: { include: { tag: true } }
              }
            }
          }
        }
      }
    });
  },

  addRelation: async (postId: string, relatedPostId: string) => {
    return prisma.postRelation.create({
      data: {
        postId,
        relatedPostId
      }
    });
  },

  removeRelation: async (postId: string, relatedPostId: string) => {
    return prisma.postRelation.deleteMany({
      where: {
        postId,
        relatedPostId
      }
    });
  }
};