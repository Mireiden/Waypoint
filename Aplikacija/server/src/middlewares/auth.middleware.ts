import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import config from "../config/config.js";
import { UnauthorizedError } from "../errors/index.js";
import { authUserSchema } from "../schemas/auth.schema.js";

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  //getting the token from the auth header will possibly be removed in future commits
  //since the token is only sent via cookies
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];
  else if (req.cookies.jwt) token = String(req.cookies.jwt);

  if (!token) throw new UnauthorizedError("Unauthorized, no token provided");

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
    });

    req.user = authUserSchema.parse(decoded);
  } catch {
    throw new UnauthorizedError("Invalid or expired token.");
  }

  next();
};

export default authMiddleware;
