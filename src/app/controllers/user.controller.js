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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("../services/user.service");
const upload_service_1 = __importDefault(require("../services/upload.service"));
exports.userController = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, email, password, avatarUrl, bannerUrl, bio } = req.body;
            const user = yield user_service_1.userService.create(name, email, password, avatarUrl, bannerUrl, bio);
            res.status(201).json(user);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    findAll: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield user_service_1.userService.findAll();
            res.json(users);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    findBySlug: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { slug } = req.params;
            const user = yield user_service_1.userService.findBySlug(slug);
            user ? res.json(user) : res.status(404).json({ error: "User not found" });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    findById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = yield user_service_1.userService.findById(id);
            user ? res.json(user) : res.status(404).json({ error: "User not found" });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = yield user_service_1.userService.update(id, req.body);
            res.json(user);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield user_service_1.userService.delete(id);
            res.status(204).send();
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    follow: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { followerId, followingId } = req.body;
            const follow = yield user_service_1.userService.follow(followerId, followingId);
            res.status(201).json(follow);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    unfollow: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { followerId, followingId } = req.body;
            yield user_service_1.userService.unfollow(followerId, followingId);
            res.status(204).send();
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    getFollowers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const followers = yield user_service_1.userService.getFollowers(id);
            res.json(followers);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    getFollowing: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const following = yield user_service_1.userService.getFollowing(id);
            res.json(following);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    addSocialLink: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Debug completo
            console.log('CONTROLLER - req.params:', req.params);
            console.log('CONTROLLER - req.body:', req.body);
            console.log('CONTROLLER - req.url:', req.url);
            console.log('CONTROLLER - req.method:', req.method);
            // Pegar userId da URL (mais RESTful)
            const { id: userId } = req.params;
            const { platform, url } = req.body;
            // Debug após extração
            console.log('CONTROLLER - Valores extraídos:', {
                userId,
                platform,
                url,
                userIdType: typeof userId,
                platformType: typeof platform,
                urlType: typeof url
            });
            // Validações
            if (!userId) {
                console.log('CONTROLLER - userId está vazio:', userId);
                res.status(400).json({ error: "userId é obrigatório" });
                return;
            }
            if (!platform) {
                console.log('CONTROLLER - platform está vazio:', platform);
                res.status(400).json({ error: "platform é obrigatório" });
                return;
            }
            if (!url) {
                console.log('CONTROLLER - url está vazio:', url);
                res.status(400).json({ error: "url é obrigatório" });
                return;
            }
            console.log('CONTROLLER - Chamando service com:', { userId, platform, url });
            const link = yield user_service_1.userService.addSocialLink(userId, platform, url);
            res.status(201).json(link);
        }
        catch (err) {
            console.log('CONTROLLER - Erro:', err.message);
            res.status(400).json({ error: err.message });
        }
    }),
    removeSocialLink: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield user_service_1.userService.removeSocialLink(id);
            res.status(204).send();
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }),
    getSocialLinks: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const links = yield user_service_1.userService.getSocialLinks(id);
            res.json(links);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    uploadAvatar: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (!req.file) {
                res.status(400).json({ error: "File is required" });
                return;
            }
            const avatarUrl = yield upload_service_1.default.uploadFile(req.file, `avatars/${id}`);
            const user = yield user_service_1.userService.update(id, { avatarUrl });
            res.json(user);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
    uploadBanner: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (!req.file) {
                res.status(400).json({ error: "File is required" });
                return;
            }
            const bannerUrl = yield upload_service_1.default.uploadFile(req.file, `banners/${id}`);
            const user = yield user_service_1.userService.update(id, { bannerUrl });
            res.json(user);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    }),
};
