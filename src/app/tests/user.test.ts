import request from "supertest";
import { prisma } from "../prisma/client";
import app from "../../app";

function afterAll(arg0: () => Promise<void>) {
  throw new Error("Function not implemented.");
}

function beforeAll(arg0: () => Promise<void>) {
  throw new Error("Function not implemented.");
}


beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("User Routes", () => {
  let userId: string;

  it("should create a new user", async () => {
    const res = await request(app)
      .post("/users")
      .send({ name: "Test User", email: "test@example.com", password: "123456" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("test@example.com");

    userId = res.body.id;
  });

  it("should get all users", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("should get a user by ID", async () => {
    const res = await request(app).get(`/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", userId);
  });

  it("should update a user", async () => {
    const res = await request(app)
      .put(`/users/${userId}`)
      .send({ name: "Updated User" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated User");
  });

  it("should delete a user", async () => {
    const res = await request(app).delete(`/users/${userId}`);
    expect(res.status).toBe(204);
  });
});

