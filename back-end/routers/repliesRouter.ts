import * as express from "express";
import { Db, ObjectID } from "mongodb";
import comb, { emptyObjectID } from "../comb";
import requireEntity from "../requireEntity";
import requireLogin from "../requireLogin";
import { Reply } from "../types";

const repliesRouter = (db: Db) => {
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
    const user = new ObjectID(req.session.user._id);
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

  router.post(
    "/:id/upVote",
    requireLogin,
    requireEntity(replies),
    async (req, res) => {
      const { id: _id } = comb(req.params, { id: emptyObjectID });
      const { upVote } = comb(req.body, { upVote: false });
      const user_id = new ObjectID(req.session.user._id);

      let reply = await replies.findOne({ _id });
      const postUpVoteIncludes =
        reply.upVote.findIndex(i => i.equals(user_id)) !== -1;

      if (postUpVoteIncludes !== upVote) {
        if (upVote) {
          reply.upVote.push(user_id);
          await replies.findOneAndUpdate(
            { _id },
            { $set: { upVote: reply.upVote } }
          );
        } else {
          reply.upVote.splice(reply.upVote.indexOf(user_id), 1);
          await replies.findOneAndUpdate(
            { _id },
            { $set: { upVote: reply.upVote } }
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
    requireEntity(replies),
    async (req, res) => {
      const { id: _id } = comb(req.params, { id: emptyObjectID });
      const user_id = new ObjectID(req.session.user._id);

      let reply = await replies.findOne({
        _id
      });
      if (reply.upVote.findIndex(i => i.equals(user_id)) !== -1) {
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

  return router;
};

export default repliesRouter;
