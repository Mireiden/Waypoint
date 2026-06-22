import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import config from "../config/config.js";
import { authUserSchema } from "../schemas/auth.schema.js";

//calls next() even if the auth fails, basically just puts any user into req.user
//used for routes that act differently based on user role.
const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];
  else if (req.cookies.jwt) token = String(req.cookies.jwt);

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
