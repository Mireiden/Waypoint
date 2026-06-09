import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import type { AuthUser } from "../types/express.js";

import config from "../config/config.js";
import { AppError } from "../errors/appError.js";

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ").at(1);
  } else if (req.cookies.jwt) {
    token = String(req.cookies.jwt);
  }
  if (!token) throw new AppError("Unauthorized, no token provided", 401);

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
    }) as AuthUser;

    req.user = decoded;

    next();
  } catch {
    throw new AppError("Unauthorized, no token provided", 401);
  }
};

export default authMiddleware;
