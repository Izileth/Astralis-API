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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const client_1 = require("../prisma/client");
const slugfy_1 = require("../utils/slugfy");
exports.userService = {
    // Criar usuário
    create: (name, email, password, avatarUrl, bannerUrl, bio) => __awaiter(void 0, void 0, void 0, function* () {
        const slugBase = (0, slugfy_1.slugify)(name);
        let slug = slugBase;
        let count = 1;
        // Garantir slug único
        while (yield client_1.prisma.user.findUnique({ where: { slug } })) {
            slug = `${slugBase}-${count++}`;
        }
        return client_1.prisma.user.create({
            data: { name, email, password, avatarUrl, bannerUrl, bio, slug },
        });
    }),
    // Buscar todos usuários
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.findMany({
            include: { posts: true, comments: true, followers: true, following: true, socialLinks: true },
        });
    }),
    // Buscar usuário por slug
    findBySlug: (slug) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.findUnique({ where: { slug }, select: { name: true, bio: true, bannerUrl: true, status: true, email: true, avatarUrl: true, posts: true, comments: true, followers: true, following: true, socialLinks: true }, });
    }),
    // Buscar usuário por ID
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.findUnique({
            where: { id },
            select: { name: true, email: true, bio: true, bannerUrl: true, status: true, avatarUrl: true, posts: true, comments: true, followers: true, following: true, socialLinks: true },
        });
    }),
    // Atualizar usuário
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.update({ where: { id }, data });
    }),
    // Deletar usuário
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.delete({ where: { id } });
    }),
    // Seguir outro usuário
    follow: (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
        if (followerId === followingId)
            throw new Error("Usuário não pode seguir a si mesmo");
        return client_1.prisma.follow.create({
            data: { followerId, followingId },
        });
    }),
    // Deixar de seguir
    unfollow: (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.follow.delete({
            where: { followerId_followingId: { followerId, followingId } },
        });
    }),
    // Listar seguidores
    getFollowers: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.follow.findMany({
            where: { followingId: userId },
            include: { follower: true },
        });
    }),
    // Listar seguindo
    getFollowing: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: true },
        });
    }),
    // Adicionar link social
    addSocialLink: (userId, platform, url) => __awaiter(void 0, void 0, void 0, function* () {
        // Debug: verificar se os parâmetros estão chegando corretamente
        console.log('SERVICE - addSocialLink - Parâmetros recebidos:', {
            userId,
            platform,
            url,
            userIdType: typeof userId,
            platformType: typeof platform,
            urlType: typeof url
        });
        // Validar parâmetros
        if (!userId || userId === 'undefined') {
            throw new Error("userId é obrigatório e não pode ser undefined");
        }
        if (!platform || platform === 'undefined') {
            throw new Error("platform é obrigatório e não pode ser undefined");
        }
        if (!url || url === 'undefined') {
            throw new Error("url é obrigatório e não pode ser undefined");
        }
        // Verificar se o usuário existe primeiro
        const userExists = yield client_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!userExists) {
            throw new Error(`Usuário com ID ${userId} não encontrado`);
        }
        console.log('SERVICE - Criando socialLink com dados:', { userId, platform, url });
        return client_1.prisma.socialLink.create({
            data: {
                userId,
                platform,
                url,
            },
        });
    }),
    // Remover link social
    removeSocialLink: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.socialLink.delete({ where: { id } });
    }),
    // Listar links sociais
    getSocialLinks: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.socialLink.findMany({ where: { userId } });
    }),
};
