import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.log(err.stack);
  res.status(500).json({
    error: err.message,
    message: "❌ Internal server error",
    status: 500,
  });
};
