import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./app/config/passport";

import authRoutes from "./app/routes/auth.routes";
import userRoutes from "./app/routes/user.routes";
import postRoutes from "./app/routes/post.routes";
import commentRoutes from "./app/routes/comment.routes";
import likeRoutes from "./app/routes/like.routes";

import { setupSwagger } from "./swagger";

const app = express();

const allowedOrigins = [
  'http://localhost:5656',
  'https://astralis-steel.vercel.app',
  'https://astralis-steel.vercel.app/'
];

app.use(cors({
  origin: function(origin: string | undefined, callback) {
    console.log('Origin da requisição:', origin); // Debug
    
    // Permitir requisições sem origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar se a origem está permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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

app.use(express.json());

// Configuração da sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET || "a-very-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS em produção
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  })
);

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

setupSwagger(app);

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
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

export default app;