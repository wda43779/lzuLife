import { Express } from "express";
import * as request from "supertest";
import getApp from "../app";
import getDb from "../db";
import { ERROR_CODE, POSTS_SORT } from "../enums";

let app: Express;
let agentLogout: request.SuperTest<request.Test>;
let agent: request.SuperTest<request.Test>;
let agent2: request.SuperTest<request.Test>;
let agentAdmin: request.SuperTest<request.Test>;

let globalPostId: string;
let globalReplyId: string;

beforeAll(async () => {
  app = await getApp();

  const db = await getDb();
  const userId = (await db.collection("users").insertOne({
    username: "testuser",
    password: "testuserpassword",
    isAdmin: false
  })).insertedId;
  console.log("userId agent: ", userId);
  await db.collection("users").insertOne({
    username: "testuser2",
    password: "testuserpassword",
    isAdmin: false
  });
  const postId = (await db.collection("posts").insertOne({
    user: userId,
    url: "http://cn.bing.com",
    upVote: []
  })).insertedId;
  globalPostId = "" + postId;

  const replyId = (await db.collection("replies").insertOne({
    user: userId,
    post: postId,
    upVote: [],
    content: "Awesome!"
  })).insertedId;
  globalReplyId = "" + replyId;

  agent = request.agent(app);
  agent2 = request.agent(app);
  agentLogout = request.agent(app);
  let loginRes1 = await agent.post("/login").send({
    username: "testuser",
    password: "testuserpassword"
  });
  console.log("agent1 logined: ", loginRes1.body);

  let loginRes2 = await agent2.post("/login").send({
    username: "testuser2",
    password: "testuserpassword"
  });
  console.log("agent2 logined: ", loginRes2.body);

  return;
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
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.AUTH_FAILED
    });
  });
  it("should unable to login with wrong username", async () => {
    let response = await request(app)
      .post("/login")
      .send({
        username: "testuser_what",
        password: "testuserpassword"
      });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.AUTH_FAILED
    });
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
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.USERS_EASY_PASSWORD
    });
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
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.AUTH_NOT_LOGIN
    });
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
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.AUTH_NOT_LOGIN
    });
  });

  it("can view a posts", async () => {
    let response = await agentLogout.get("/posts/" + globalPostId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    expect(response.body.post._id).toBe(globalPostId);
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
    let response = await agent
      .post("/posts/" + globalPostId + "/content")
      .send({ content: "a" });
    expect(response.body.success).toBe(true);
    expect(response.body.post.content).toBe("a");

    response = await agent
      .post("/posts/" + globalPostId + "/content")
      .send({ content: "b" });
    expect(response.body.success).toBe(true);
    expect(response.body.post.content).toBe("b");
  });

  it("can't edit content by other", async () => {
    let response = await agent2
      .post("/posts/" + globalPostId + "/content")
      .send({ content: "a" });
    expect(response.status).toBe(403);
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

    response = await agent.del("/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe("Reply module", () => {
  it("can reply to post", async () => {
    let response = await agent.post("/replies").send({
      content: "Awesome post!",
      post: globalPostId
    });
    expect(response.body.success).toBe(true);
    expect(response.body.reply._id).toBeDefined();
    expect(response.body.reply.post).toBe(globalPostId);
  });
  it("can create a reply for posts", async () => {
    return;
  });
  it("can create a reply for posts and refer to another reply", async () => {
    return;
  });

  it("can delete your reply", async () => {
    return;
  });

  // it("can reply to post and refer to another post", async () => {
  //   let response = await agent().post("/replies").send({
  //     content: "Awesome post!",
  //     post: globalPostId
  //   });
  //   expect(response.body.success).toBe(true);
  //   expect(response.body.reply._id).toBeDefined();
  // });
});

describe("Up vote module", () => {
  it("can get your up vote on posts", async () => {
    let response = await agent.get("/posts/" + globalPostId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote);
  });
  it("can up vote on posts", async () => {
    let response = await agent
      .post("/posts/" + globalPostId + "/upVote")
      .send({ upVote: true });
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(true);

    response = await agent.get("/posts/" + globalPostId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(true);
  });
  it("can revoke up vote on posts", async () => {
    let response = await agent
      .post("/posts/" + globalPostId + "/upVote")
      .send({ upVote: false });
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(false);

    response = await agent.get("/posts/" + globalPostId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(false);
  });

  it("can get your up vote on reply", async () => {
    let response = await agent.get("/replies/" + globalReplyId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote);
  });
  it("can up vote on reply", async () => {
    let response = await agent
      .post("/replies/" + globalReplyId + "/upVote")
      .send({ upVote: true });
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(true);

    response = await agent.get("/replies/" + globalReplyId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(true);
  });
  it("can revoke up vote on reply", async () => {
    let response = await agent
      .post("/replies/" + globalReplyId + "/upVote")
      .send({ upVote: false });
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(false);

    response = await agent.get("/replies/" + globalReplyId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(false);
  });
});
