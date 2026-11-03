import type { Request, Response } from "express";

import { treeifyError } from "zod";

import { ValidationError } from "../errors/index.js";
import {
  createReviewSchema,
  listReviewsQuerySchema,
  updateReviewSchema,
} from "../schemas/review.schema.js";
import * as reviewService from "../services/review.service.js";
import { assertAuth } from "../utils/assertAuth.js";
import { getFiles } from "../utils/files.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const getById = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const review = await reviewService.findById(id);
  res.json(review);
};

export const getByDestinationId = async (req: Request, res: Response) => {
  const destId = parseIdParam(req.params.id);

  const parsed = listReviewsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const review = await reviewService.findByDestinationId(destId, parsed.data);
  res.json(review);
};

export const createReview = async (req: Request, res: Response) => {
  assertAuth(req);
  const userId = req.user.id;
  const destId = parseIdParam(req.params.id);
  const files = getFiles(req);

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const review = await reviewService.createReview(destId, userId, parsed.data, files);
  res.status(201).json(review);
};

export const updateReview = async (req: Request, res: Response) => {
  assertAuth(req);
  const id = parseIdParam(req.params.id, "review id");

  const parsed = updateReviewSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const updated = await reviewService.updateReview(id, req.user, parsed.data);
  res.json(updated);
};

export const deleteReview = async (req: Request, res: Response) => {
  assertAuth(req);
  const id = parseIdParam(req.params.id, "review id");
  await reviewService.deleteReview(id, req.user);
  res.status(204).send();
};
