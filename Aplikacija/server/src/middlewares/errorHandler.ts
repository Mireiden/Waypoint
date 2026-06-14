import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../../generated/prisma/client.js";
import config from "../config/config.js";
import { AppError } from "../errors/appError.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 - unique constraint
    if (err.code === "P2002") {
      res.status(409).json({ error: "Resource already exists" });
      return;
    }
    // P2025 - record not found
    if (err.code === "P2025") {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res
      .status(400)
      .json({
        error: "Database error",
        ...(config.server.env !== "production" && { code: err.code, meta: err.meta }),
      });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ error: "Invalid data" });
    return;
  }

  console.error(err.stack);
  res.status(500).json({
    error: config.server.env === "production" ? "Internal server error" : err.message,
  });
};
