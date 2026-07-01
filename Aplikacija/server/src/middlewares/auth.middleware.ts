import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import config from "../config/config.js";
import { UnauthorizedError } from "../errors/index.js";
import { authUserSchema } from "../schemas/auth.schema.js";

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.jwt ? String(req.cookies.jwt) : undefined;

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
