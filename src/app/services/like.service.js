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
exports.likeService = void 0;
const client_1 = require("../prisma/client");
exports.likeService = {
    // Post Likes
    likePost: (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.like.create({
            data: { userId, postId },
        });
    }),
    unlikePost: (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.like.delete({
            where: { userId_postId: { userId, postId } },
        });
    }),
    countLikes: (postId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.like.count({ where: { postId } });
    }),
    // Comment Likes
    likeComment: (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () {
        // Opcional: verificar se o comentário existe primeiro
        const comment = yield client_1.prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) {
            throw new Error("Comment not found");
        }
        return client_1.prisma.like.create({
            data: { userId, commentId },
        });
    }),
    unlikeComment: (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.like.delete({
            where: { userId_commentId: { userId, commentId } },
        });
    }),
    countCommentLikes: (commentId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.like.count({ where: { commentId } });
    }),
};
