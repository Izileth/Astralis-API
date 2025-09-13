import express from "express";
import cors from "cors"

import authRoutes from "./app/routes/auth.routes";
import userRoutes from "./app/routes/user.routes";
import postRoutes from "./app/routes/post.routes";
import commentRoutes from "./app/routes/comment.routes";
import likeRoutes from "./app/routes/like.routes";

import { setupSwagger } from "./swagger";

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

//Rota de Teste

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


export default app;