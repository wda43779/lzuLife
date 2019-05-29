import { Express } from "express";
import * as request from "supertest";
import getApp from "../app";
import { ERROR_CODE, POSTS_SORT } from "../enums";

let app: Express;
let agentLogout: request.SuperTest<request.Test>;
let agent: request.SuperTest<request.Test>;
let agent2: request.SuperTest<request.Test>;
let agentAdmin: request.SuperTest<request.Test>;

beforeAll(async () => {
  app = await getApp();
  agentLogout = request.agent(app);
  agent = request.agent(app);
  agent2 = request.agent(app);
  await agent.post("/users").send({
    username: "testuser",
    password: "testuserpassword"
  });
  await agent.post("/users").send({
    username: "testuser2",
    password: "testuserpassword"
  });
  await agent.post("/login").send({
    username: "testuser",
    password: "testuserpassword"
  });
  await agent2.post("/login").send({
    username: "testuser2",
    password: "testuserpassword"
  });
});

describe("Auth:delete", () => {
  it("should able to delete", async () => {
    const agent = request.agent(app);
    let response = await agent.post("/users").send({
      username: "testdelete",
      password: "testuserpassword"
    });
    response = await agent.post("/login").send({
      username: "testdelete",
      password: "testuserpassword"
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    response = await agent.del("/me");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe("Auth:login", () => {
  it("should able to login", async () => {
    let response = await request(app)
      .post("/login")
      .send({
        username: "testuser",
        password: "testuserpassword"
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should unable to login with wrong password", async () => {
    let response = await request(app)
      .post("/login")
      .send({
        username: "testuser",
        password: "testuserpassword_bad"
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
    expect(response.body.errorCode).toBe(ERROR_CODE.AUTH_FAILED);
  });
  it("should unable to login with wrong username", async () => {
    let response = await request(app)
      .post("/login")
      .send({
        username: "testuser_what",
        password: "testuserpassword"
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
    expect(response.body.errorCode).toBe(ERROR_CODE.AUTH_FAILED);
  });
});

describe("Users", () => {
  it("can't sign up without username", async () => {
    let response = await agent.post("/users").send({
      password: "testuserpassword"
    });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.USERS_BAD_USERNAME
    });
  });

  it("can't sign up with easy password", async () => {
    let response = await agent.post("/users").send({
      username: "hello_hello_",
      password: "123"
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(true);
    expect(response.body.errorCode).toBe(ERROR_CODE.USERS_EASY_PASSWORD);
  });

  it("can inspect yourself", async () => {
    let response = await agent.get("/me");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user);
  });

  it("can't inspect yourself without log in", async () => {
    let response = await agentLogout.get("/me");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe(true);
    expect(response.body.errorCode).toBe(ERROR_CODE.AUTH_NOT_LOGIN);
  });
});

describe("Reply", () => {
  it("can create a reply for posts", async () => {
    return;
  });
  it("can create a reply for posts and refer to another reply", async () => {
    return;
  });

  it("can delete your reply", async () => {
    return;
  });
});

describe("Posts", () => {
  it("can add a post", async () => {
    let response = await agent.post("/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    expect(response.body.post._id);
  });
  it("can't post without a account", async () => {
    let response = await agentLogout.post("/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe(true);
    expect(response.body.errorCode).toBe(ERROR_CODE.AUTH_NOT_LOGIN);
    expect(response.body.post);
  });

  it("can add a post and view a posts by public", async () => {
    let response = await agent.post("/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.body.post);
    let postId = response.body.post._id;

    response = await agentLogout.get("/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    expect(response.body.post._id).toBe(postId);
  });

  it("can list all share in time order", async () => {
    let response = await agent.get("/posts").query({
      sort: POSTS_SORT.TIME
    });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    response = await agent.get("/posts");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    response = await agent.get("/posts").query({
      sort: POSTS_SORT.TIME,
      skip: 0,
      pageSize: 5
    });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect((<Array<any>>response.body).length).toBeLessThanOrEqual(5);
  });

  it("can edit content by it's owner", async () => {
    return;
  });

  it("can't edit content by it's other's", async () => {
    return;
  });

  it("can delete your posts", async () => {
    let response = await agent.post("/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.body.post);
    let postId = response.body.post._id;
    response = await agent.delete("/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("can't delete by others", async () => {
    let response = await agent.post("/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    let postId = response.body.post._id;

    // response = await agent2.del("/posts/" + postId);
    // expect(response.body.error).toBe(true);

    response = await agent.del("/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("can't delete by logout user", async () => {
    let response = await agent.post("/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    let postId = response.body.post._id;

    response = await agentLogout.del("/posts/" + postId);
    expect(response.body.error).toBe(true);

    response = await agent.del("/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe("Up vote module", () => {
  it("can get your up vote on posts", async () => {
    return;
  });
  it("can up vote on posts", async () => {
    return;
  });
  it("can revoke up vote on posts", async () => {
    return;
  });

  it("can get your up vote on reply", async () => {
    return;
  });
  it("can up vote on reply", async () => {
    return;
  });
  it("can revoke up vote on reply", async () => {
    return;
  });
});
