import type { Request } from "express";

import { BadRequestError } from "../errors/badRequestError.js";

export const requireFiles = (req: Request): Express.Multer.File[] => {
  if (!Array.isArray(req.files) || req.files.length === 0) {
    throw new BadRequestError("No files uploaded");
  }
  return req.files;
};
