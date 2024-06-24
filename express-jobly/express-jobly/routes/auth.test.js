"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { createToken } = require("../helpers/tokens");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/token */

describe("POST /auth/token", function () {
  test("works", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "u1",
          password: "password1",
        });
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth with non-existent user", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "no-such-user",
          password: "password1",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with wrong password", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "u1",
          password: "nope",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: "u1",
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/auth/token")
        .send({
          username: 42,
          password: "above-is-a-number",
        });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** POST /auth/register */

describe("POST /auth/register", function () {
  test("works for anon", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new",
          firstName: "first",
          lastName: "last",
          password: "password",
          email: "new@email.com",
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("bad request with missing fields", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new",
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "new",
          firstName: "first",
          lastName: "last",
          password: "password",
          email: "not-an-email",
        });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** Auth Middleware */

describe("Auth Middleware", function () {
  test("fails: anonymous user", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: invalid token", async function () {
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer invalid-token`);
    expect(resp.statusCode).toEqual(401);
  });

  test("works: admin access", async function () {
    const adminToken = createToken({ username: "admin", isAdmin: true });
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
  });

  test("works: non-admin access", async function () {
    const userToken = createToken({ username: "user", isAdmin: false });
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(200);
  });

  test("works: ensure correct user or admin", async function () {
    const adminToken = createToken({ username: "admin", isAdmin: true });
    const userToken = createToken({ username: "user", isAdmin: false });

    const resp1 = await request(app)
        .get("/users/user")
        .set("authorization", `Bearer ${userToken}`);
    expect(resp1.statusCode).toEqual(200);

    const resp2 = await request(app)
        .get("/users/user")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp2.statusCode).toEqual(200);
  });
});
