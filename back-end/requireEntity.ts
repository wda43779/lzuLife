import { RequestHandler, Request } from "express";
import "express-session";
import { Collection, ObjectID } from "mongodb";
import { ERROR_CODE } from "./enums";

const defaultAtFunction: (req: Request) => string = req => req.params["id"];

const requireEntityMiddleWare: (
  c: Collection,
  at?: (req: Request) => any
) => RequestHandler = (c, at = defaultAtFunction) => {
  return async (req, res, next) => {
    const _id: ObjectID = new ObjectID(at(req));
    const hasEntity: boolean = !!(await c.find({ _id }).count());

    if (!hasEntity) {
      res.status(404);
      res.send({
        error: true,
        errorCode: ERROR_CODE.NOT_FOUND
      });
      return;
    }
    next();
  };
};

export default requireEntityMiddleWare;
