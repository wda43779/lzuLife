import * as _MongoStore from "connect-mongo";
import * as express from "express";
import * as session from "express-session";
import { Db, ObjectID } from "mongodb";
import * as validator from "validator";
import comb, { emptyObjectID } from "./comb";
import getDb from "./db";
import { ERROR_CODE, POSTS_SORT } from "./enums";
import requireLogin from "./requireLogin";
import requireEntity from "./requireEntity";

interface User {
  _id?: ObjectID;

  username: string;
  password: string;
  isAdmin: boolean;
}
interface Post {
  _id?: ObjectID;

  user: ObjectID;
  upVote: ObjectID[];

  url: string;
  content?: string;
}
interface Reply {
  _id?: ObjectID;

  user: ObjectID;
  post: ObjectID;
  refer?: ObjectID;
  upVote: ObjectID[];

  content: string;
}

declare global {
  namespace Express {
    interface SessionData {
      user?: User;
    }
  }
}

const authController = (db: Db) => {
  const router = express.Router();
  const users = db.collection<User>("users");

  router.post("/login", async (req, res) => {
    const { username, password } = comb(req.body, {
      username: "",
      password: ""
    });

    let user = await users.findOne({ username });
    if (user) {
      const rightPassword = user["password"];
      if (password === rightPassword) {
        if (req.session.user) {
          req.session.regenerate(err => {
            req.session.user = user;
          });
        }
        req.session.user = user;
        res.send({
          success: true
        });
        return;
      }
    }

    res.status(400);
    res.send({
      error: true,
      errorCode: ERROR_CODE.AUTH_FAILED
    });
    return;
  });

  router.get("/me", requireLogin, async (req, res) => {
    res.send({
      success: true,
      user: req.session.user
    });
    return;
  });

  router.delete("/me", requireLogin, async (req, res) => {
    const {
      username = ""
    }: { username: string; password: string } = req.session.user;
    await users.findOneAndDelete({ username });
    req.session.regenerate(err => {});
    res.send({
      success: true
    });
    return;
  });

  return router;
};

const postController = (db: Db) => {
  const router = express.Router();
  const posts = db.collection<Post>("posts");

  router.get("/", async (req, res) => {
    const { sort, skip, pageSize } = comb(req.query, {
      sort: POSTS_SORT.TIME,
      skip: 0,
      pageSize: 5
    });
    switch (sort) {
      default:
      case POSTS_SORT.TIME:
        res.send(await posts.find({}, { skip, limit: pageSize }).toArray());
        return;
      case POSTS_SORT.HN:
        res.send({
          error: true
        });
        return;
      case POSTS_SORT.BBS:
        res.send({
          error: true
        });
        return;
    }
  });

  router.post("/", requireLogin, async (req, res) => {
    const { url } = comb(req.body, {
      url: ""
    });
    if (!validator.isURL(url)) {
      console.log(url);
      res.send({
        error: true
      });
      return;
    }
    const resu = await posts.insertOne({
      url,
      user: req.session.user._id,
      upVote: []
    });
    res.send({
      success: true,
      post: resu.ops[0]
    });
  });

  router.get("/:id", async (req, res) => {
    const { id } = comb(req.params, { id: "000000000000000000000000" });

    const post = await posts.findOne({
      _id: new ObjectID(id)
    });
    if (post) {
      res.send({
        success: true,
        post
      });
    } else {
      res.status(404);
      res.send({
        error: true,
        errorCode: ERROR_CODE.NOT_FOUND
      });
    }
  });

  router.post(
    "/:id/content",
    requireLogin,
    requireEntity(posts),
    async (req, res) => {
      const { id } = comb(req.params, { id: "000000000000000000000000" });
      const { content } = comb(req.body, { content: "" });
      const _id = new ObjectID(id);

      let post = await posts.findOne({
        _id
      });
      if (post.user === req.session.user._id) {
        post.content = content;
        await posts.findOneAndUpdate({ _id }, { $set: { content } });
        res.send({
          success: true,
          post
        });
      } else {
        res.status(403);
        res.send({
          error: true,
          errorCode: ERROR_CODE.AUTH_FORBIDDEN
        });
      }
    }
  );

  router.get(
    "/:id/upVote",
    requireLogin,
    requireEntity(posts),
    async (req, res) => {
      const { id } = comb(req.params, { id: "000000000000000000000000" });
      const _id = new ObjectID(id);

      let post = await posts.findOne({ _id });

      if (post.upVote.includes(req.session.user._id)) {
        res.send({
          success: true,
          upVote: true
        });
      } else {
        res.send({
          success: true,
          upVote: false
        });
      }
    }
  );

  router.post(
    "/:id/upVote",
    requireLogin,
    requireEntity(posts),
    async (req, res) => {
      const { id } = comb(req.params, { id: "000000000000000000000000" });
      const { upVote } = comb(req.body, { upVote: false });
      const _id = new ObjectID(id);
      const user_id = req.session.user._id;

      let post = await posts.findOne({ _id });
      const postUpVoteIncludes = post.upVote.includes(user_id);
      const dstUpVote = upVote;

      if (postUpVoteIncludes !== dstUpVote) {
        if (dstUpVote) {
          await posts.findOneAndUpdate({ _id }, { $push: { upVote: user_id } });
        } else {
          post.upVote.splice(post.upVote.indexOf(user_id), 1);
          await posts.findOneAndUpdate(
            { _id },
            { $set: { upVote: post.upVote } }
          );
        }
      }
      res.send({
        success: true,
        upVote
      });
    }
  );

  router.get("/:id/upVote", requireLogin, async (req, res) => {
    const { id } = comb(req.params, { id: "000000000000000000000000" });
    const _id = new ObjectID(id);

    let post = await posts.findOne({
      _id
    });
    if (post.upVote.includes(req.session.user._id)) {
      res.send({
        success: true,
        upVote: true
      });
    } else {
      res.send({
        success: true,
        upVote: false
      });
    }
  });

  router.delete("/:id", requireLogin, async (req, res) => {
    const { id } = comb(req.params, { id: "000000000000000000000000" });
    const _id = new ObjectID(id);
    const user_id = req.session.user._id;

    const post = await posts.findOne({ _id });
    if (post) {
      if (post.user === user_id) {
        await posts.findOneAndDelete({ _id });
        res.send({
          success: true
        });
      } else {
        res.status(403);
        res.send({
          error: true
        });
      }
    } else {
      res.send({
        error: true
      });
    }
  });

  return router;
};

const usersController = (db: Db) => {
  const router = express.Router();
  const usersCollection = db.collection<{
    _id?: ObjectID;
    username: string;
    password: string;
    isAdmin: boolean;
  }>("users");

  router.post("/", async (req, res) => {
    const { username, password } = comb(req.body, {
      username: "",
      password: ""
    });

    if (username.length < 1) {
      res.status(400);
      res.send({
        error: true,
        errorCode: ERROR_CODE.USERS_BAD_USERNAME
      });
      return;
    }
    if (
      await usersCollection.findOne({
        username
      })
    ) {
      res.status(400);
      res.send({
        error: true,
        errorCode: ERROR_CODE.USERS_EXIST
      });
      return;
    }
    if (password.length < 8) {
      res.status(400);
      res.send({
        error: true,
        errorCode: ERROR_CODE.USERS_EASY_PASSWORD
      });
      return;
    }

    res.send(
      await usersCollection.insertOne({
        username,
        password,
        isAdmin: false
      })
    );
  });

  return router;
};

const repliesController = (db: Db) => {
  const router = express.Router();
  const replies = db.collection<Reply>("replies");

  router.get("/", async (req, res) => {
    const { skip, pageSize } = comb(req.query, {
      skip: 0,
      pageSize: 5
    });
    res.send(await replies.find({}, { skip, limit: pageSize }).toArray());
  });

  router.post("/", requireLogin, async (req, res) => {
    const { content, post } = comb(req.body, {
      content: "",
      post: emptyObjectID
    });
    const user = req.session.user._id;
    let reply: Reply = {
      content,
      user,
      post,
      upVote: []
    };
    if (req.body.refer) {
      const { refer } = comb(req.body, {
        refer: emptyObjectID
      });
      reply.refer = refer;
    }
    reply._id = (await replies.insertOne(reply)).insertedId;
    res.send({
      success: true,
      reply
    });
  });

  router.get("/:id", requireEntity(replies), async (req, res) => {
    const { id: _id } = comb(req.body, { id: emptyObjectID });
    res.send({
      success: true,
      reply: await replies.findOne({ _id })
    });
  });

  return router;
};

const init = async () => {
  const app = express();

  const db = await getDb();
  const MongoStore = _MongoStore(session);

  app.use(express.json());
  app.use(
    session({
      secret: "lzu",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000
      },
      store: new MongoStore({
        db: db
      })
    })
  );

  app.get("/", (req, res) => res.send("Hello World!"));
  app.use("/", authController(db));
  app.use("/users", usersController(db));
  app.use("/posts", postController(db));
  app.use("/replies", postController(db));

  return app;
};

export default init;
