import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import type { AuthUser } from "../types/express.js";

import config from "../config/config.js";
import { UnauthorizedError } from "../errors/index.js";

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = String(req.cookies.jwt);
  }
  if (!token) throw new UnauthorizedError("Unauthorized, no token provided");

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
    }) as AuthUser;

    req.user = decoded;

    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token.");
  }
};

export function assertAuth(req: Request): asserts req is Request & { user: AuthUser } {
  if (!req.user) throw new UnauthorizedError();
}

export default authMiddleware;
