import type { NextFunction, Request, Response } from "express";

import { ForbiddenError } from "../errors/index.js";
import { assertAuth } from "../utils/assertAuth.js";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  assertAuth(req);
  if (req.user.role !== "admin") throw new ForbiddenError();
  next();
};

export default adminMiddleware;
