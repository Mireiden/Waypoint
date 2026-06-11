import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/appError.js";
import { assertAuth } from "./auth.middleware.js";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  assertAuth(req);
  if (req.user.role !== "admin") throw new AppError("Forbidden", 403);
  next();
};

export default adminMiddleware;
