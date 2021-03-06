import * as _MongoStore from "connect-mongo";
import * as express from "express";
import * as session from "express-session";

import getDb from "./db";
import { User } from "./types";

import authRouter from "./routers/authRouter";
import usersRouter from "./routers/usersRouter";
import postsRouter from "./routers/postsRouter";
import repliesRouter from "./routers/repliesRouter";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare global {
  namespace Express {
    interface SessionData {
      user?: Omit<User, "_id"> & { _id: string };
    }
  }
}

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
        maxAge: 5 * 24 * 60 * 60 * 1000
      },
      store: new MongoStore({
        db: db
      })
    })
  );

  app.get("/", (req, res) => res.send("Hello World!"));

  // Inject routers
  app.use("/api/v1/", authRouter(db));
  app.use("/api/v1/users", usersRouter(db));
  app.use("/api/v1/posts", postsRouter(db));
  app.use("/api/v1/replies", repliesRouter(db));

  return app;
};

export default init;
