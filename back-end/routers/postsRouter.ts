import * as express from "express";
import { Db, ObjectID } from "mongodb";
import * as validator from "validator";
import comb, { emptyObjectID } from "../comb";
import { ERROR_CODE, POSTS_SORT } from "../enums";
import requireEntity from "../requireEntity";
import requireLogin from "../requireLogin";
import { Post } from "../types";

const postRouter = (db: Db) => {
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
        res.send(
          await posts
            .find({}, { skip, limit: pageSize, sort: { _id: -1 } })
            .toArray()
        );
        return;
      case POSTS_SORT.HN:
        res.send({
          error: true,
          errorCode: "NOT_IMPLEMENT"
        });
        return;
      case POSTS_SORT.BBS:
        res.send({
          error: true,
          errorCode: "NOT_IMPLEMENT"
        });
        return;
    }
  });

  router.post("/", requireLogin, async (req, res) => {
    const { title, url } = comb(req.body, {
      title: "",
      url: ""
    });
    if (!validator.isURL(url)) {
      res.status(400);
      res.send({
        error: true,
        errorCode: ERROR_CODE.BAD_REQUEST
      });
      return;
    }
    const resu = await posts.insertOne({
      title,
      url,
      user: new ObjectID(req.session.user._id),
      upVote: []
    });
    res.send({
      success: true,
      post: resu.ops[0]
    });
  });

  router.get("/:id", requireEntity(posts), async (req, res) => {
    const { id: _id } = comb(req.params, { id: emptyObjectID });

    const post = await posts.findOne({ _id });
    res.send({
      success: true,
      post
    });
  });

  router.post(
    "/:id/content",
    requireLogin,
    requireEntity(posts),
    async (req, res) => {
      const { id: _id } = comb(req.params, { id: emptyObjectID });
      const { content } = comb(req.body, { content: "" });

      let post = await posts.findOne({ _id });
      if (post.user.equals(req.session.user._id)) {
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

  router.post(
    "/:id/upVote",
    requireLogin,
    requireEntity(posts),
    async (req, res) => {
      const { id: _id } = comb(req.params, { id: emptyObjectID });
      const { upVote } = comb(req.body, { upVote: false });
      const user_id = new ObjectID(req.session.user._id);

      let post = await posts.findOne({ _id });
      const postUpVoteIncludes =
        post.upVote.findIndex(i => i.equals(user_id)) !== -1;
      const dstUpVote = upVote;

      if (postUpVoteIncludes !== dstUpVote) {
        if (dstUpVote) {
          post.upVote.push(user_id);
          await posts.findOneAndUpdate(
            { _id },
            { $set: { upVote: post.upVote } }
          );
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

  router.get(
    "/:id/upVote",
    requireLogin,
    requireEntity(posts),
    async (req, res) => {
      const { id: _id } = comb(req.params, { id: emptyObjectID });
      const user_id = new ObjectID(req.session.user._id);

      let post = await posts.findOne({
        _id
      });
      if (post.upVote.findIndex(i => i.equals(user_id)) !== -1) {
        res.send({
          success: true,
          upVote: true,
          upVoteCount: post.upVote.length
        });
      } else {
        res.send({
          success: true,
          upVote: false,
          upVoteCount: post.upVote.length
        });
      }
    }
  );

  router.delete("/:id", requireLogin, async (req, res) => {
    const { id: _id } = comb(req.params, { id: emptyObjectID });
    const user_id = new ObjectID(req.session.user._id);

    const post = await posts.findOne({ _id });
    if (post) {
      if (post.user.equals(user_id)) {
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

export default postRouter;
