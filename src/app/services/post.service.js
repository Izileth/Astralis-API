"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const client_1 = require("../prisma/client");
const slugfy_1 = require("../utils/slugfy");
exports.postService = {
    findByIdOrThrow: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const post = yield exports.postService.findById(id);
        if (!post) {
            throw new Error(`Post with id '${id}' not found`);
        }
        return post;
    }),
    create: (authorId, title, content, options) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { description, imageUrl, videoUrl, categoryName, tagNames, relatedPostIds, sharedLinks } = options || {};
            const slugBase = (0, slugfy_1.slugify)(title);
            let slug = slugBase;
            let count = 1;
            // Garantir slug único
            while (yield client_1.prisma.post.findUnique({ where: { slug } })) {
                slug = `${slugBase}-${count++}`;
            }
            // Criar ou buscar categoria se fornecida
            let categoryId;
            if (categoryName) {
                const category = yield client_1.prisma.category.upsert({
                    where: { name: categoryName },
                    update: {},
                    create: { name: categoryName }
                });
                categoryId = category.id;
            }
            // Criar ou buscar tags se fornecidas
            let tagConnections = [];
            if (tagNames && tagNames.length > 0) {
                const tagPromises = tagNames.map(tagName => client_1.prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName }
                }));
                const tags = yield Promise.all(tagPromises);
                tagConnections = tags.map(tag => ({ tagId: tag.id }));
            }
            // Criar o post
            const post = yield client_1.prisma.post.create({
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
                        create: (sharedLinks === null || sharedLinks === void 0 ? void 0 : sharedLinks.map(link => ({ platform: link.platform, url: link.url }))) || [],
                    },
                },
            });
            // Criar as relações se houver
            if (relatedPostIds && relatedPostIds.length > 0) {
                yield client_1.prisma.postRelation.createMany({
                    data: relatedPostIds.map(relatedPostId => ({
                        postId: post.id,
                        relatedPostId
                    })),
                    skipDuplicates: true
                });
            }
            // USAR O MÉTODO SEGURO - garante retorno tipado ou erro
            return yield exports.postService.findByIdOrThrow(post.id);
        }
        catch (error) {
            console.error('Error creating post:', error);
            throw error; // Re-lança o erro para que o controller possa capturar
        }
    }),
    // Buscar todos posts
    findAll: (filters) => __awaiter(void 0, void 0, void 0, function* () {
        const where = {};
        if ((filters === null || filters === void 0 ? void 0 : filters.published) !== undefined) {
            where.published = filters.published;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.categoryName) {
            where.category = {
                name: {
                    contains: filters.categoryName,
                    mode: 'insensitive'
                }
            };
        }
        if ((filters === null || filters === void 0 ? void 0 : filters.tagNames) && filters.tagNames.length > 0) {
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
        if (filters === null || filters === void 0 ? void 0 : filters.authorId) {
            where.authorId = filters.authorId;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.search) {
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
        return client_1.prisma.post.findMany({
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
    }),
    // Buscar post por slug
    findBySlug: (slug) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.post.findUnique({
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
    }),
    // Buscar post por ID
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.post.findUnique({
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
    }),
    // Atualizar post com sistema dinâmico
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { tagNames, relatedPostIds, sharedLinks, categoryName } = data, rest = __rest(data, ["tagNames", "relatedPostIds", "sharedLinks", "categoryName"]);
            // Verificar se o post existe antes de tentar atualizar
            const existingPost = yield client_1.prisma.post.findUnique({ where: { id } });
            if (!existingPost) {
                throw new Error(`Post with id '${id}' not found`);
            }
            // Processar categoria se fornecida
            let categoryId = undefined;
            if (categoryName !== undefined) {
                if (categoryName) {
                    const category = yield client_1.prisma.category.upsert({
                        where: { name: categoryName },
                        update: {},
                        create: { name: categoryName }
                    });
                    categoryId = category.id;
                }
                else {
                    categoryId = null; // Remove categoria se string vazia
                }
            }
            // Processar tags se fornecidas
            let tagConnections = [];
            if (tagNames !== undefined) {
                if (tagNames && tagNames.length > 0) {
                    const tagPromises = tagNames.map(tagName => client_1.prisma.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName }
                    }));
                    const tags = yield Promise.all(tagPromises);
                    tagConnections = tags.map(tag => ({ tagId: tag.id }));
                }
            }
            // Atualizar os campos básicos do post
            yield client_1.prisma.post.update({
                where: { id },
                data: Object.assign(Object.assign(Object.assign(Object.assign({}, rest), (categoryId !== undefined && { categoryId })), (tagNames !== undefined && {
                    tags: {
                        deleteMany: {},
                        create: tagConnections
                    }
                })), (sharedLinks !== undefined && {
                    sharedLinks: {
                        deleteMany: {},
                        create: sharedLinks.map(link => ({ platform: link.platform, url: link.url }))
                    }
                })),
            });
            // Atualizar posts relacionados separadamente se fornecido
            if (relatedPostIds !== undefined) {
                yield client_1.prisma.postRelation.deleteMany({
                    where: { postId: id }
                });
                if (relatedPostIds.length > 0) {
                    yield client_1.prisma.postRelation.createMany({
                        data: relatedPostIds.map(relatedPostId => ({
                            postId: id,
                            relatedPostId
                        })),
                        skipDuplicates: true
                    });
                }
            }
            // USAR O MÉTODO SEGURO - garante retorno tipado ou erro
            return yield exports.postService.findByIdOrThrow(id);
        }
        catch (error) {
            console.error('Error updating post:', error);
            throw error; // Re-lança o erro para que o controller possa capturar
        }
    }),
    // Deletar post com limpeza de categorias e tags não utilizadas
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        // Buscar o post para obter suas relações antes da transação
        const post = yield client_1.prisma.post.findUnique({
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
        yield client_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Remover todas as relações que dependem do post
            yield tx.postRelation.deleteMany({
                where: { OR: [{ postId: id }, { relatedPostId: id }] },
            });
            yield tx.postTag.deleteMany({ where: { postId: id } });
            yield tx.comment.deleteMany({ where: { postId: id } });
            yield tx.like.deleteMany({ where: { postId: id } });
            yield tx.sharedLink.deleteMany({ where: { postId: id } });
            // 2. Agora, deletar o post com segurança
            yield tx.post.delete({ where: { id } });
            // 3. Limpar tags órfãs (tags que não estão mais associadas a nenhum post)
            for (const postTag of post.tags) {
                const tagUsageCount = yield tx.postTag.count({
                    where: { tagId: postTag.tag.id },
                });
                if (tagUsageCount === 0) {
                    yield tx.tag.delete({ where: { id: postTag.tag.id } });
                }
            }
            // 4. Limpar categoria órfã se não tiver mais posts
            if (post.category) {
                const categoryUsageCount = yield tx.post.count({
                    where: { categoryId: post.category.id },
                });
                if (categoryUsageCount === 0) {
                    yield tx.category.delete({ where: { id: post.category.id } });
                }
            }
        }));
        return { success: true, message: "Post deleted successfully" };
    }),
    // Buscar posts por categoria (agora por nome)
    findByCategory: (categoryName) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.post.findMany({
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
    }),
    // Buscar posts por tag (agora por nome)
    findByTag: (tagName) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.post.findMany({
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
    }),
    // NOVAS FUNÇÕES
    // Listar todas as categorias com contagem de posts
    getAllCategories: () => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.category.findMany({
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
    }),
    // Listar todas as tags com contagem de posts
    getAllTags: () => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.tag.findMany({
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
    }),
    // Buscar posts mais curtidos
    getMostLikedPosts: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10) {
        return client_1.prisma.post.findMany({
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
    }),
    // Buscar posts mais recentes
    getRecentPosts: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10) {
        return client_1.prisma.post.findMany({
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
    }),
    // Buscar posts relacionados por categoria e tags
    findSimilarPosts: (postId_1, ...args_1) => __awaiter(void 0, [postId_1, ...args_1], void 0, function* (postId, limit = 5) {
        const post = yield client_1.prisma.post.findUnique({
            where: { id: postId },
            include: {
                category: true,
                tags: { include: { tag: true } }
            }
        });
        if (!post)
            return [];
        const tagIds = post.tags.map(pt => pt.tag.id);
        return client_1.prisma.post.findMany({
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
    }),
    // Buscar posts do autor
    findByAuthor: (authorId, filters) => __awaiter(void 0, void 0, void 0, function* () {
        const { published, limit, skip } = filters || {};
        return client_1.prisma.post.findMany(Object.assign(Object.assign({ where: Object.assign({ authorId }, (published !== undefined && { published })), include: {
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
            }, orderBy: {
                createdAt: 'desc'
            } }, (limit && { take: limit })), (skip && { skip })));
    }),
    // Funcões de relação mantidas
    findRelatedPosts: (postId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.post.findUnique({
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
    }),
    addRelation: (postId, relatedPostId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.postRelation.create({
            data: {
                postId,
                relatedPostId
            }
        });
    }),
    removeRelation: (postId, relatedPostId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.postRelation.deleteMany({
            where: {
                postId,
                relatedPostId
            }
        });
    })
};
