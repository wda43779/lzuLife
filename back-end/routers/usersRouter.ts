import * as express from "express";
import { Db } from "mongodb";
import comb, { emptyObjectID } from "../comb";
import { ERROR_CODE } from "../enums";
import requireEntityMiddleWare from "../requireEntity";
import { User } from "../types";

const usersRouter = (db: Db) => {
  const router = express.Router();
  const usersCollection = db.collection<User>("users");

  router.get(
    "/:id",
    requireEntityMiddleWare(usersCollection),
    async (req, res) => {
      const { id: _id } = comb(req.params, { id: emptyObjectID });

      const user = await usersCollection.findOne({ _id });
      res.send({
        success: true,
        user
      });
    }
  );

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

export default usersRouter;
