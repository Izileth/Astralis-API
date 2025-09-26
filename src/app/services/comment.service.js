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
exports.commentService = void 0;
const client_1 = require("../prisma/client");
exports.commentService = {
    create: (authorId, postId, content) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.comment.create({
            data: { authorId, postId, content },
        });
    }),
    findByPost: (postId) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.comment.findMany({
            where: { postId },
            include: { author: true },
        });
    }),
    update: (commentId, userId, newContent) => __awaiter(void 0, void 0, void 0, function* () {
        const comment = yield client_1.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment || comment.authorId !== userId) {
            throw new Error("Comment not found or user not authorized to edit");
        }
        return client_1.prisma.comment.update({
            where: { id: commentId },
            data: { content: newContent },
        });
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        // Adicionar verificação de autorização aqui também seria uma boa prática,
        // mas mantendo o foco na tarefa solicitada.
        return client_1.prisma.comment.delete({ where: { id } });
    }),
};
