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
exports.commentController = void 0;
const comment_service_1 = require("../services/comment.service");
exports.commentController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const authorId = req.userId;
            const { postId, content } = req.body; // postId vem do body, conforme a rota
            if (!authorId) {
                res.status(401).json({ error: "Unauthorized: User not authenticated" });
                return;
            }
            if (!postId || !content) {
                res.status(400).json({ error: "Missing required fields: postId and content" });
                return;
            }
            const comment = yield comment_service_1.commentService.create(authorId, postId, content);
            res.status(201).json(comment);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    findByPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { postId } = req.params;
        const comments = yield comment_service_1.commentService.findByPost(postId);
        res.json(comments);
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            const { id: commentId } = req.params;
            const { content } = req.body;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized: User not authenticated" });
                return;
            }
            if (!content) {
                res.status(400).json({ error: "Missing required field: content" });
                return;
            }
            const updatedComment = yield comment_service_1.commentService.update(commentId, userId, content);
            res.status(200).json(updatedComment);
        }
        catch (err) {
            // O service lança erro se não encontrar ou o usuário não for autorizado
            res.status(403).json({ error: err.message });
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        yield comment_service_1.commentService.delete(id);
        res.status(204).send();
    }),
};
