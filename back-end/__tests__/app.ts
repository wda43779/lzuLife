import { Express } from "express";
import * as request from "supertest";
import getApp from "../app";
import getDb from "../db";
import { ERROR_CODE, POSTS_SORT } from "../enums";
import { once } from "lodash";

const getAppOnce = once(getApp);
const getDbOnce = once(getDb);

const agentLoginWith = async (
  username?: string,
  password?: string
): Promise<request.SuperTest<request.Test>> => {
  const agent = request.agent(await getAppOnce());
  if (username && password) {
    await agent.post("/api/v1/login").send({
      username,
      password
    });
  }
  return agent;
};

beforeAll(async () => {
  const db = await getDbOnce();
  // promise there is two users, one post and one reply
  const userId = (await db.collection("users").insertOne({
    username: "testuser",
    password: "testuserpassword",
    isAdmin: false
  })).insertedId;
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
  const replyId = (await db.collection("replies").insertOne({
    user: userId,
    post: postId,
    upVote: [],
    content: "Awesome!"
  })).insertedId;
});

describe("Auth:delete", () => {
  it("should able to delete", async () => {
    const agent = request.agent(await getAppOnce());
    let response = await agent.post("/api/v1/users").send({
      username: "testdelete",
      password: "testuserpassword"
    });
    response = await agent.post("/api/v1/login").send({
      username: "testdelete",
      password: "testuserpassword"
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    response = await agent.del("/api/v1/me");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe("Auth:login", () => {
  it("should able to login", async () => {
    let response = await request(await getAppOnce())
      .post("/api/v1/login")
      .send({
        username: "testuser",
        password: "testuserpassword"
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should unable to login with wrong password", async () => {
    let response = await request(await getAppOnce())
      .post("/api/v1/login")
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
    let response = await request(await getAppOnce())
      .post("/api/v1/login")
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
    let response = await request(await getAppOnce())
      .post("/api/v1/users")
      .send({
        password: "testuserpassword"
      });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.USERS_BAD_USERNAME
    });
  });

  it("can't sign up with easy password", async () => {
    let response = await request(await getAppOnce())
      .post("/api/v1/users")
      .send({
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
    const agent = await agentLoginWith("testuser", "testuserpassword");

    let response = await agent.get("/api/v1/me");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user);
  });

  it("can't inspect yourself without log in", async () => {
    let response = await request(await getAppOnce()).get("/api/v1/me");
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.AUTH_NOT_LOGIN
    });
  });
});

describe("Posts", () => {
  it("can add a post", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");

    let response = await agent.post("/api/v1/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    expect(response.body.post._id);
  });
  it("can't post without a account", async () => {
    let response = await request(await getAppOnce())
      .post("/api/v1/posts")
      .send({
        url: "http://cn.bing.com"
      });
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: true,
      errorCode: ERROR_CODE.AUTH_NOT_LOGIN
    });
  });

  it("can view a posts", async () => {
    const db = await getDbOnce();
    const postId = (await db.collection("posts").findOne({}))._id + "";
    let response = await request(await getAppOnce()).get(
      "/api/v1/posts/" + postId
    );
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    expect(response.body.post._id).toBe(postId);
  });

  it("can add a post and view a posts by public", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");

    let response = await agent.post("/api/v1/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.body.post);
    let postId = response.body.post._id;

    response = await request(await getAppOnce()).get("/api/v1/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    expect(response.body.post._id).toBe(postId);
  });

  it("can list all share in time order", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");

    let response = await agent.get("/api/v1/posts").query({
      sort: POSTS_SORT.TIME
    });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    response = await agent.get("/api/v1/posts");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    response = await agent.get("/api/v1/posts").query({
      sort: POSTS_SORT.TIME,
      skip: 0,
      pageSize: 5
    });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect((<Array<any>>response.body).length).toBeLessThanOrEqual(5);
  });

  it("can edit content by it's owner", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");
    const db = await getDbOnce();
    const postId = (await db.collection("posts").findOne({}))._id + "";

    let response = await agent
      .post("/api/v1/posts/" + postId + "/content")
      .send({ content: "a" });
    expect(response.body.success).toBe(true);
    expect(response.body.post.content).toBe("a");

    response = await agent
      .post("/api/v1/posts/" + postId + "/content")
      .send({ content: "b" });
    expect(response.body.success).toBe(true);
    expect(response.body.post.content).toBe("b");
  });

  it("can't edit content by other", async () => {
    const agent2 = await agentLoginWith("testuser2", "testuserpassword");
    const db = await getDbOnce();
    const postId = (await db.collection("posts").findOne({}))._id + "";

    let response = await agent2
      .post("/api/v1/posts/" + postId + "/content")
      .send({ content: "a" });
    expect(response.status).toBe(403);
  });

  it("can delete your posts", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");

    let response = await agent.post("/api/v1/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.body.post);
    let postId = response.body.post._id;
    response = await agent.delete("/api/v1/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("can't delete by others", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");

    let response = await agent.post("/api/v1/posts").send({
      url: "http://cn.bing.com"
    });
    expect(response.body.success).toBe(true);
    expect(response.body.post);
    let postId = response.body.post._id;

    response = await agent.del("/api/v1/posts/" + postId);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe("Reply module", () => {
  it("can reply to post", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");
    const db = await getDbOnce();
    const replyId = (await db.collection("replies").findOne({}))._id + "";

    let response = await agent.post("/api/v1/replies").send({
      content: "Awesome post!",
      post: replyId
    });
    expect(response.body.success).toBe(true);
    expect(response.body.reply._id).toBeDefined();
    expect(response.body.reply.post).toBe(replyId);
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
});

describe("Up vote module", () => {
  it("can get your up vote on posts", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");
    const db = await getDbOnce();
    const postId = (await db.collection("posts").findOne({}))._id + "";

    let response = await agent.get("/api/v1/posts/" + postId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote);
  });
  it("can up vote on posts", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");
    const db = await getDbOnce();
    const postId = (await db.collection("posts").findOne({}))._id + "";

    let response = await agent
      .post("/api/v1/posts/" + postId + "/upVote")
      .send({ upVote: true });
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(true);

    response = await agent.get("/api/v1/posts/" + postId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(true);
  });

  it("can revoke up vote on posts", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");
    const db = await getDbOnce();
    const postId = (await db.collection("posts").findOne({}))._id + "";

    let response = await agent
      .post("/api/v1/posts/" + postId + "/upVote")
      .send({ upVote: false });
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(false);

    response = await agent.get("/api/v1/posts/" + postId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(false);
  });

  it("can get your up vote on reply", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");
    const db = await getDbOnce();
    const replyId = (await db.collection("replies").findOne({}))._id + "";

    let response = await agent.get("/api/v1/replies/" + replyId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote);
  });
  it("can up vote on reply", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");
    const db = await getDbOnce();
    const replyId = (await db.collection("replies").findOne({}))._id + "";

    let response = await agent
      .post("/api/v1/replies/" + replyId + "/upVote")
      .send({ upVote: true });
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(true);

    response = await agent.get("/api/v1/replies/" + replyId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(true);
  });
  it("can revoke up vote on reply", async () => {
    const agent = await agentLoginWith("testuser", "testuserpassword");
    const db = await getDbOnce();
    const replyId = (await db.collection("replies").findOne({}))._id + "";

    let response = await agent
      .post("/api/v1/replies/" + replyId + "/upVote")
      .send({ upVote: false });
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(false);

    response = await agent.get("/api/v1/replies/" + replyId + "/upVote");
    expect(response.body.success).toBe(true);
    expect(response.body.upVote).toBe(false);
  });
});
