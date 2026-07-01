import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import config from "../config/config.js";
import { authUserSchema } from "../schemas/auth.schema.js";

//calls next() even if the auth fails, basically just puts any user into req.user
//used for routes that act differently based on user role.
const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.jwt ? String(req.cookies.jwt) : undefined;

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
    });

    req.user = authUserSchema.parse(decoded);
  } catch {}

  next();
};

export default optionalAuthMiddleware;
