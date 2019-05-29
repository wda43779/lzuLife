import { RequestHandler } from "express";
import "express-session";
import { ERROR_CODE } from "./enums";

const requireLoginMiddleWare: RequestHandler = (req, res, next) => {
  if (!req.session.user) {
    res.status(401);
    res.send({
      error: true,
      errorCode: ERROR_CODE.AUTH_NOT_LOGIN
    });
    return;
  }
  next();
};

export default requireLoginMiddleWare;
