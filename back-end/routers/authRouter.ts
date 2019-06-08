import { Router } from "express";
import { Db } from "mongodb";
import comb from "../comb";
import { ERROR_CODE } from "../enums";
import requireLogin from "../requireLogin";
import { User } from "../types";

const authRouter = (db: Db) => {
  const router = Router();
  const users = db.collection<User>("users");

  router.post("/login", async (req, res) => {
    const { username, password } = comb(req.body, {
      username: "",
      password: ""
    });

    let user: any = await users.findOne({ username });
    if (user) {
      const rightPassword = user["password"];
      if (password === rightPassword) {
        if (req.session.user) {
          req.session.regenerate(err => {
            req.session.user = user;
          });
        }
        req.session.user = user;
        req.session.save(err => {
          res.send({
            success: true
          });
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

export default authRouter;
