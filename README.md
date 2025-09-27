# Astralis API

![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-v20.x-green)
![Express](https://img.shields.io/badge/Express-4.x-green)
![Prisma](https://img.shields.io/badge/Prisma-6.x-lightgrey)

API RESTful para uma plataforma de conteúdo, como um blog ou rede social, construída com Node.js, Express, TypeScript e Prisma.

## Visão Geral

A Astralis API fornece um backend robusto para gerenciamento de usuários, posts, comentários, likes, e mais. Inclui autenticação baseada em JWT, upload de mídias para Cloudinary, e um sistema de documentação de API com Swagger.

## Principais Funcionalidades

- **Autenticação**: Registro, login (local e social com Google/Discord), e gerenciamento de sessão com JWT.
- **Gerenciamento de Usuários**: CRUD de usuários, perfis, avatares, banners, e sistema de seguir/deixar de seguir.
- **Gerenciamento de Posts**: CRUD completo para posts, com suporte a rascunhos, publicação, categorias e tags.
- **Conteúdo Rico**: Upload de imagens e vídeos associados aos posts.
- **Interação Social**: Sistema de comentários e likes em posts e comentários.
- **Descoberta de Conteúdo**: Rotas para encontrar posts populares, recentes, similares e relacionados.
- **Busca**: Funcionalidade de busca avançada por posts.
- **Documentação da API**: Geração automática de documentação com Swagger.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express, TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (recomendado)
- **Autenticação**: JWT (JSON Web Tokens), Passport.js para OAuth
- **Upload de Arquivos**: Multer, Cloudinary
- **Testes**: Jest, Supertest (configuração inicial)
- **Containerização**: Docker

## Começando

Siga estas instruções para ter uma cópia do projeto rodando em sua máquina local para desenvolvimento e testes.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20.x ou superior)
- [Docker](https://www.docker.com/) (opcional, para o banco de dados)
- Um arquivo `.env` na raiz do projeto com as variáveis de ambiente. Veja `env.example` para um modelo.

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/astralis-api.git
   cd astralis-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto e adicione as chaves necessárias (banco de dados, JWT, Cloudinary, etc.).

4. **Inicie o banco de dados com Docker:**
   ```bash
   docker-compose up -d
   ```

5. **Aplique as migrações do Prisma:**
   ```bash
   npx prisma migrate dev
   ```

### Rodando a Aplicação

- **Modo de Desenvolvimento:**
  ```bash
  npm run dev
  ```
  O servidor irá reiniciar automaticamente a cada mudança nos arquivos.

- **Modo de Produção:**
  ```bash
  npm run build
  npm start
  ```

## Documentação da API

A documentação completa da API é gerada automaticamente pelo Swagger e está disponível em:

`http://localhost:3000/api-docs`

## Mapa de Rotas da API

Todas as rotas são prefixadas com `/api`.

### Autenticação (`/auth`)

| Método | Rota                  | Descrição                                  | Protegido |
|--------|-----------------------|--------------------------------------------|-----------|
| POST   | `/register`           | Registra um novo usuário.                  | Não       |
| POST   | `/login`              | Autentica um usuário e retorna um token.   | Não       |
| GET    | `/me`                 | Retorna os dados do usuário autenticado.   | Sim       |
| POST   | `/refresh-token`      | Gera um novo token de acesso.              | Sim       |
| POST   | `/forgot-password`    | Envia um link de redefinição de senha.     | Não       |
| POST   | `/reset-password`     | Redefine a senha do usuário.               | Não       |
| GET    | `/google`             | Inicia o fluxo de autenticação com Google. | Não       |
| GET    | `/google/callback`    | Callback da autenticação com Google.       | Não       |
| GET    | `/discord`            | Inicia o fluxo de autenticação com Discord.| Não       |
| GET    | `/discord/callback`   | Callback da autenticação com Discord.      | Não       |

### Usuários (`/users`)

| Método | Rota                  | Descrição                                  | Protegido |
|--------|-----------------------|--------------------------------------------|-----------|
| POST   | `/`                   | Cria um novo usuário (alternativa ao register). | Não       |
| GET    | `/profile`            | Lista todos os usuários.                   | Sim       |
| GET    | `/profile/:slug`      | Busca um usuário pelo seu slug.            | Não       |
| GET    | `/:id`                | Busca um usuário pelo seu ID.              | Não       |
| PUT    | `/:id`                | Atualiza os dados de um usuário.           | Sim       |
| DELETE | `/:id`                | Deleta um usuário.                         | Sim       |
| POST   | `/follow`             | Seguir um usuário.                         | Sim       |
| DELETE | `/unfollow`           | Deixar de seguir um usuário.               | Sim       |
| GET    | `/:id/followers`      | Lista os seguidores de um usuário.         | Não       |
| GET    | `/:id/following`      | Lista quem um usuário está seguindo.       | Não       |
| POST   | `/:id/avatar`         | Upload do avatar do usuário.               | Sim       |
| POST   | `/:id/banner`         | Upload do banner do usuário.               | Sim       |

### Posts (`/posts`)

| Método | Rota                       | Descrição                                  | Protegido |
|--------|----------------------------|--------------------------------------------|-----------|
| POST   | `/`                        | Cria um novo post.                         | Sim       |
| GET    | `/`                        | Lista todos os posts com filtros.          | Não       |
| GET    | `/slug/:slug`              | Busca um post pelo seu slug.               | Não       |
| GET    | `/:id`                     | Busca um post pelo seu ID.                 | Não       |
| PUT    | `/:id`                     | Atualiza um post.                          | Sim       |
| DELETE | `/:id`                     | Deleta um post.                            | Sim       |
| GET    | `/categories/all`          | Lista todas as categorias.                 | Não       |
| GET    | `/tags/all`                | Lista todas as tags.                       | Não       |
| GET    | `/category/:categoryName`  | Busca posts por categoria.                 | Não       |
| GET    | `/tag/:tagName`            | Busca posts por tag.                       | Não       |
| GET    | `/discover/most-liked`     | Lista os posts mais curtidos.              | Não       |
| GET    | `/discover/recent`         | Lista os posts mais recentes.              | Não       |
| GET    | `/utils/stats`             | Retorna estatísticas sobre os posts.       | Não       |
| GET    | `/utils/search`            | Realiza uma busca avançada nos posts.      | Não       |
| POST   | `/utils/upload-image`      | Faz upload de uma imagem para um post.     | Sim       |
| GET    | `/author/:authorId`        | Busca posts de um autor específico.        | Não       |
| GET    | `/:id/similar`             | Encontra posts similares.                  | Não       |
| GET    | `/:id/related`             | Lista posts relacionados.                  | Não       |
| PATCH  | `/:id/toggle-publish`      | Publica ou despublica um post.             | Sim       |
| POST   | `/relations`               | Adiciona uma relação entre dois posts.     | Sim       |
| DELETE | `/relations`               | Remove uma relação entre dois posts.       | Sim       |
| POST   | `/:id/media`               | Faz upload de mídia (imagem/vídeo) para um post. | Sim       |

### Comentários (`/comments`)

| Método | Rota                  | Descrição                                  | Protegido |
|--------|-----------------------|--------------------------------------------|-----------|
| POST   | `/`                   | Adiciona um comentário a um post.          | Sim       |
| GET    | `/post/:postId`       | Lista todos os comentários de um post.     | Não       |
| PUT    | `/:id`                | Atualiza um comentário.                    | Sim       |
| DELETE | `/:id`                | Deleta um comentário.                      | Sim       |

### Likes (`/likes`)

| Método | Rota                       | Descrição                                  | Protegido |
|--------|----------------------------|--------------------------------------------|-----------|
| POST   | `/posts`                   | Curte um post.                             | Sim       |
| DELETE | `/posts`                   | Descurte um post.                          | Sim       |
| GET    | `/posts/count/:postId`     | Conta as curtidas de um post.              | Não       |
| POST   | `/comments/:commentId`     | Curte um comentário.                       | Sim       |
| DELETE | `/comments/:commentId`     | Descurte um comentário.                    | Sim       |
| GET    | `/comments/count/:commentId`| Conta as curtidas de um comentário.      | Não       |

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

Este projeto está licenciado sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.