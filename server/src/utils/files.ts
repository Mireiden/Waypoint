import type { Request } from "express";

import { BadRequestError } from "../errors/badRequestError.js";

export const getFiles = (req: Request): Express.Multer.File[] =>
  Array.isArray(req.files) ? req.files : [];

export const requireFiles = (req: Request): Express.Multer.File[] => {
  const files = getFiles(req);
  if (files.length === 0) {
    throw new BadRequestError("No files uploaded");
  }
  return files;
};
