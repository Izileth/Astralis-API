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
exports.likeController = void 0;
const like_service_1 = require("../services/like.service");
exports.likeController = {
    // Post Likes
    likePost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            const { postId } = req.body;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized: User not authenticated" });
                return;
            }
            if (!postId) {
                res.status(400).json({ error: "Missing required field: postId" });
                return;
            }
            const like = yield like_service_1.likeService.likePost(userId, postId);
            res.status(201).json(like);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    unlikePost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            const { postId } = req.body;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized: User not authenticated" });
                return;
            }
            if (!postId) {
                res.status(400).json({ error: "Missing required field: postId" });
                return;
            }
            yield like_service_1.likeService.unlikePost(userId, postId);
            res.status(204).send();
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    countLikes: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { postId } = req.params;
        const count = yield like_service_1.likeService.countLikes(postId);
        res.json({ postId, likes: count });
    }),
    // Comment Likes
    likeComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            const { commentId } = req.params;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized: User not authenticated" });
                return;
            }
            const like = yield like_service_1.likeService.likeComment(userId, commentId);
            res.status(201).json(like);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    unlikeComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            const { commentId } = req.params;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized: User not authenticated" });
                return;
            }
            yield like_service_1.likeService.unlikeComment(userId, commentId);
            res.status(204).send();
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    countCommentLikes: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { commentId } = req.params;
        const count = yield like_service_1.likeService.countCommentLikes(commentId);
        res.json({ commentId, likes: count });
    }),
};
