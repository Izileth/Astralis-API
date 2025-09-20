# RESTful API with Node.js, Express, and Prisma

This is a robust and scalable RESTful API built with Node.js, Express, and Prisma ORM. It provides a foundation for creating, reading, updating, and deleting resources, with a focus on security, performance, and maintainability.

## Features

*   **CRUD Operations:** Full support for creating, reading, updating, and deleting resources.
*   **Authentication and Authorization:** Secure endpoints with JWT-based authentication and middleware.
*   **Database Management:** Uses Prisma for intuitive and safe database access.
*   **Clear Structure:** Organized project structure for easy navigation and development.
*   **API Documentation:** Includes detailed API documentation with examples.
*   **Testing:** Comes with a pre-configured testing environment using Jest.

## Technologies Used

*   **Node.js:** JavaScript runtime for building the server-side application.
*   **Express:** Web framework for Node.js, used to create the RESTful API.
*   **Prisma:** Modern database toolkit for PostgreSQL, MySQL, and SQLite.
*   **TypeScript:** Superset of JavaScript that adds static typing.
*   **JWT (JSON Web Tokens):** For securing API endpoints.
*   **Jest:** For writing and running tests.
*   **Docker:** For containerizing the application and database.

## Getting Started

### Prerequisites

*   Node.js (v14 or later)
*   npm or yarn
*   Docker (for running the database)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/crud-api.git
    cd crud-api
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the database:**

    *   Start the PostgreSQL database using Docker:

        ```bash
        docker-compose up -d
        ```

    *   Apply the database schema:

        ```bash
        npx prisma db push
        ```

4.  **Start the server:**

    ```bash
    npm run dev
    ```

The API will be available at `http://localhost:3000`.

## API Endpoints

The following are the main endpoints provided by the API:

*   `POST /auth/register`: Register a new user.
*   `POST /auth/login`: Log in and get a JWT token.
*   `GET /users`: Get a list of all users.
*   `GET /users/:id`: Get a specific user by ID.
*   `PUT /users/:id`: Update a user's information.
*   `DELETE /users/:id`: Delete a user.
*   `GET /posts`: Get a list of all posts.
*   `POST /posts`: Create a new post.
*   `GET /posts/:id`: Get a specific post by ID.
*   `PUT /posts/:id`: Update a post.
*   `DELETE /posts/:id`: Delete a post.

For more details on each endpoint, please refer to the `api.http` file.

## Database Schema

The database schema is defined in the `prisma/schema.prisma` file. It includes the following models:

*   `User`: Represents a user of the application.
*   `Post`: Represents a post created by a user.
*   `Comment`: Represents a comment on a post.
*   `Like`: Represents a like on a post.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
