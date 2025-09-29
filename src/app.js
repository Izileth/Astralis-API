"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./app/config/passport"));
const auth_routes_1 = __importDefault(require("./app/routes/auth.routes"));
const user_routes_1 = __importDefault(require("./app/routes/user.routes"));
const post_routes_1 = __importDefault(require("./app/routes/post.routes"));
const comment_routes_1 = __importDefault(require("./app/routes/comment.routes"));
const like_routes_1 = __importDefault(require("./app/routes/like.routes"));
const swagger_1 = require("./swagger");
const app = (0, express_1.default)();
const allowedOrigins = [
    'https://astralis-steel.vercel.app',
    'https://astralis-steel.vercel.app',
    'http://localhost:5656',
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        console.log('Origin da requisição:', origin); // Debug
        // Permitir requisições sem origin (Postman, curl, etc.)
        if (!origin)
            return callback(null, true);
        // Verificar se a origem está permitida
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log('Origin rejeitada:', origin);
            callback(new Error('Bloqueado pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Cache-Control',
        'Cookie',
        'Set-Cookie',
        'Access-Control-Allow-Origin'
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization'],
    optionsSuccessStatus: 200,
    preflightContinue: false
}));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Verificação de tipo segura
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Cookie, Set-Cookie');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, Authorization');
    // Responder a requisições OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});
app.use(express_1.default.json());
// Configuração da sessão
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "a-very-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS em produção
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));
// Inicialização do Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, swagger_1.setupSwagger)(app);
// Rota de Teste
app.get("/", (req, res) => {
    res.redirect("/api");
});
app.get("/test", (req, res) => {
    res.json("API is running...");
});
app.get("/api", (req, res) => {
    res.json({
        message: "Welcome to the Social Media API",
        routes: {
            auth: "/api/auth",
            users: "/api/users",
            posts: "/api/posts",
            comments: "/api/comments",
            likes: "/api/likes"
        }
    });
});
// Rotas principais
app.use('/api/auth', auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/posts", post_routes_1.default);
app.use("/api/comments", comment_routes_1.default);
app.use("/api/likes", like_routes_1.default);
// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.originalUrl
    });
});
exports.default = app;
